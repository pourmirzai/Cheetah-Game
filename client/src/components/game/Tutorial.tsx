interface TutorialProps {
  onClose: () => void;
}

export default function Tutorial({ onClose }: TutorialProps) {
  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6" data-testid="tutorial-overlay">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">چگونه بازی کنیم؟</h2>
        
        <div className="space-y-4 text-right">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-accent rounded-full flex-shrink-0"></div>
            <p className="text-sm">با لمس و کشیدن چپ-راست مادر یوز را هدایت کنید</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-secondary rounded-full flex-shrink-0"></div>
            <p className="text-sm">آب و طعمه جمع‌آوری کنید تا خانواده سالم بماند</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-destructive rounded-full flex-shrink-0"></div>
            <p className="text-sm">از سگ‌ها، دام‌ها و شکارچیان دوری کنید</p>
          </div>
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 bg-primary rounded-full flex-shrink-0"></div>
            <p className="text-sm">دوبار تپ برای جهش سرعت و فرار از خطر</p>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-6 rounded-lg w-full"
          data-testid="button-close-tutorial"
        >
          متوجه شدم!
        </button>
      </div>
    </div>
  );
}
