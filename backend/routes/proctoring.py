from flask import Blueprint, request, jsonify
from flask import g
from database import db, ProctoringEvent, Attempt
from utils.decorators import token_required, validate_request_json
from datetime import datetime

proctoring_bp = Blueprint('proctoring', __name__)

@proctoring_bp.route('/<attempt_id>/event', methods=['POST'])
@token_required
@validate_request_json(['eventType', 'timestamp'])
def log_proctor_event(attempt_id):
    """Log a proctoring event"""
    try:
        user_id = get_jwt_identity()
        attempt = Attempt.query.get(attempt_id)
        
        if not attempt:
            return jsonify({'error': 'Attempt not found'}), 404
        
        if attempt.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        event_type = data['eventType']
        meta = data.get('meta', {})
        severity = data.get('severity', 'warning')
        
        # Validate event type
        valid_events = ['tab-switch', 'fullscreen-exit', 'face-lost', 'multiple-faces', 'copy-paste-attempt']
        if event_type not in valid_events:
            return jsonify({'error': 'Invalid event type'}), 400
        
        # Create event
        event = ProctoringEvent(
            attempt_id=attempt_id,
            user_id=user_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            meta=meta,
            severity=severity
        )
        
        db.session.add(event)
        
        # Increment warning count for warning/critical events
        if severity in ['warning', 'critical']:
            attempt.warnings += 1
        
        # Update suspicion score
        severity_weights = {'info': 0.1, 'warning': 0.5, 'critical': 1.0}
        attempt.suspicion_score += severity_weights.get(severity, 0.5)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Event logged',
            'event': event.to_dict(),
            'warnings': attempt.warnings,
            'suspicionScore': attempt.suspicion_score
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@proctoring_bp.route('/<attempt_id>/events', methods=['GET'])
def get_proctor_events(attempt_id):
    """Get all proctoring events for an attempt (no JWT required)"""
    try:
        attempt = Attempt.query.get(attempt_id)
        if not attempt:
            return jsonify({'error': 'Attempt not found'}), 404
        events = ProctoringEvent.query.filter_by(attempt_id=attempt_id).order_by(ProctoringEvent.timestamp).all()
        return jsonify({
            'attemptId': attempt_id,
            'events': [e.to_dict() for e in events],
            'totalEvents': len(events),
            'warnings': attempt.warnings,
            'suspicionScore': attempt.suspicion_score
        }), 200
    except Exception as e:
        import traceback
        print('Error in get_proctor_events:', e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@proctoring_bp.route('/<attempt_id>/webcam-snapshot', methods=['POST'])
@token_required
@validate_request_json(['snapshot', 'timestamp'])
def save_webcam_snapshot(attempt_id):
    """Save a webcam snapshot"""
    try:
        user_id = get_jwt_identity()
        attempt = Attempt.query.get(attempt_id)
        
        if not attempt:
            return jsonify({'error': 'Attempt not found'}), 404
        
        if attempt.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        snapshot_data = data['snapshot']  # Base64 encoded image
        
        # In production, this would be saved to cloud storage (Firebase Storage, AWS S3, etc)
        # For now, we'll just log the event
        event = ProctoringEvent(
            attempt_id=attempt_id,
            user_id=user_id,
            event_type='webcam-snapshot',
            timestamp=datetime.utcnow(),
            meta={
                'snapshotUrl': f'/snapshots/{attempt_id}_{datetime.utcnow().timestamp()}.jpg'
            },
            severity='info'
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({
            'message': 'Snapshot saved',
            'snapshotUrl': event.meta['snapshotUrl']
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@proctoring_bp.route('/<attempt_id>/face-detection', methods=['POST'])
@token_required
@validate_request_json(['detections'])
def log_face_detection(attempt_id):
    """Log face detection results"""
    try:
        user_id = get_jwt_identity()
        attempt = Attempt.query.get(attempt_id)
        
        if not attempt:
            return jsonify({'error': 'Attempt not found'}), 404
        
        if attempt.user_id != user_id:
            return jsonify({'error': 'Access denied'}), 403
        
        data = request.get_json()
        detections = data['detections']
        confidence = data.get('confidence', 0.0)
        
        event_type = 'face-lost'
        severity = 'warning'
        
        if len(detections) > 1:
            event_type = 'multiple-faces'
            severity = 'critical'
        elif len(detections) == 1 and confidence >= 0.7:
            event_type = 'face-detected'
            severity = 'info'
        
        event = ProctoringEvent(
            attempt_id=attempt_id,
            user_id=user_id,
            event_type=event_type,
            timestamp=datetime.utcnow(),
            meta={
                'faceCount': len(detections),
                'confidence': confidence,
                'detections': detections
            },
            severity=severity
        )
        
        db.session.add(event)
        
        if severity in ['warning', 'critical']:
            attempt.warnings += 1
            attempt.suspicion_score += 0.5 if severity == 'warning' else 1.0
        
        db.session.commit()
        
        return jsonify({
            'message': 'Face detection logged',
            'event': event.to_dict(),
            'warnings': attempt.warnings,
            'suspicionScore': attempt.suspicion_score
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
