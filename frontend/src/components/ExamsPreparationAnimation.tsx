import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ExamsPreparationAnimation() {
  return (
    <div className="w-full flex items-center justify-center">
      <DotLottieReact
        src={"/src/components/Exams Preparation..json"}
        loop
        autoplay
        style={{ width: 680, height: 680 }}
      />
    </div>
  );
}
