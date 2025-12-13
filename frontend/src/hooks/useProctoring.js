import { useEffect, useRef } from "react";

export default function useProctoring({
  enabled,
  onViolation,
  maxWarnings = 3
}) {
  const warningCount = useRef(0);

  const raiseViolation = (type) => {
    warningCount.current += 1;

    onViolation({
      type,
      count: warningCount.current
    });

    if (warningCount.current >= maxWarnings) {
      onViolation({ type: "AUTO_SUBMIT" });
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // TAB SWITCH / VISIBILITY
    const handleVisibility = () => {
      if (document.hidden) {
        raiseViolation("TAB_SWITCH");
      }
    };

    // WINDOW BLUR
    const handleBlur = () => {
      raiseViolation("WINDOW_BLUR");
    };

    // FULLSCREEN EXIT
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        raiseViolation("FULLSCREEN_EXIT");
      }
    };

    // RIGHT CLICK
    const disableContextMenu = (e) => {
      e.preventDefault();
      raiseViolation("RIGHT_CLICK");
    };

    // COPY / PASTE
    const blockCopyPaste = (e) => {
      e.preventDefault();
      raiseViolation("COPY_PASTE");
    };

    // KEYBOARD SHORTCUTS
    const handleKeyDown = (e) => {
      const blocked =
        (e.ctrlKey && ["c", "v", "p", "u"].includes(e.key.toLowerCase())) ||
        e.key === "F12";

      if (blocked) {
        e.preventDefault();
        raiseViolation("KEYBOARD_SHORTCUT");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreen);
    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("copy", blockCopyPaste);
    document.addEventListener("paste", blockCopyPaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreen);
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("copy", blockCopyPaste);
      document.removeEventListener("paste", blockCopyPaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}
