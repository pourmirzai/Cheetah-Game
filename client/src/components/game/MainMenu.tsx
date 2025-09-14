import { useEffect, useState } from "react";
import { backgroundManager, BackgroundConfig } from "@/lib/backgroundManager";
import { getBestScore } from "@/lib/cookieStorage";
import { trackEducationalVisit } from "@/lib/analytics";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BestScore {
  cubsSurvived: number;
  monthsCompleted: number;
  finalScore: number;
  achievementTitle: string;
  date: string;
}

interface MainMenuProps {
  onStartGame: () => void;
  onDownloadStory?: (bestScore: BestScore) => void;
}

export default function MainMenu({ onStartGame, onDownloadStory }: MainMenuProps) {
  const [currentBackground, setCurrentBackground] = useState<BackgroundConfig | null>(null);
  const [bestScore, setBestScore] = useState<BestScore | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBasicInfo, setShowBasicInfo] = useState(false);

  const getDeviceType = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? 'mobile' : 'desktop';
    }
    return 'unknown';
  };

  useEffect(() => {
    backgroundManager.initialize();
    const bg = backgroundManager.getCurrentBackground();
    setCurrentBackground(bg || null);

    // Check for existing best score
    const savedBestScore = getBestScore();
    setBestScore(savedBestScore);

    // Trigger animations after component mounts
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const backgroundStyle = currentBackground ? backgroundManager.getBackgroundStyle(currentBackground) : {};

  return (
    <div className="relative flex flex-col items-center justify-center p-1 sm:p-2 md:p-4 text-center md-motion-standard min-h-dvh overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }} data-testid="main-menu">
      {/* Dynamic background with enhanced overlay */}
      <div className="absolute inset-0" style={backgroundStyle}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30"></div>

      {/* Animated particles for visual appeal */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content container with enhanced animations */}
      <div className={`relative z-10 w-full ${showBasicInfo ? 'max-w-5xl pt-2 sm:pt-4' : 'max-w-2xl'} space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 px-2 sm:px-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header section - only show when educational info is NOT shown */}
        {!showBasicInfo && (
          <>
            {/* Header section with enhanced Material Design card and glow effect */}
            <div className="md-elevated-card text-center space-y-6 relative">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 rounded-lg blur-xl"></div>

              <div className="relative space-y-3 sm:space-y-4 md:space-y-6 w-full">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight tracking-tight animate-fade-in" style={{
                  animationDelay: '0.1s',
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  بازی حفاظت از یوزپلنگ آسیایی
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed animate-fade-in bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent" style={{ 
                  animationDelay: '0.2s',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}>
                  ماموریت ۱۸ ماهه
                </p>
              </div>

              {/* Enhanced cheetah family illustration with better animations */}
              <div className="relative my-4 sm:my-6 md:my-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                {/* Mother cheetah with enhanced styling and floating animation */}
                <div className="w-48 h-32 sm:w-56 sm:h-40 md:w-64 md:h-48 mx-auto mb-4 sm:mb-6 relative">
                  <img
                    src="/assets/sprites/characters/mother-cheetah.webp"
                    alt="Cheetah Mother"
                    className="w-full h-full object-contain animate-float"
                  />
                </div>
                {/* Four cubs following with staggered animations */}
                <div className="flex justify-center space-x-3 sm:space-x-4 md:space-x-6 space-x-reverse">
                  <img
                    src="/assets/sprites/characters/cub.webp"
                    alt="Cheetah Cub 1"
                    className="w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-14 animate-bounce-gentle"
                    style={{ animationDelay: '0.8s' }}
                  />
                  <img
                    src="/assets/sprites/characters/cub.webp"
                    alt="Cheetah Cub 2"
                    className="w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-14 animate-bounce-gentle"
                    style={{ animationDelay: '1s' }}
                  />
                  <img
                    src="/assets/sprites/characters/cub.webp"
                    alt="Cheetah Cub 3"
                    className="w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-14 animate-bounce-gentle"
                    style={{ animationDelay: '1.2s' }}
                  />
                  <img
                    src="/assets/sprites/characters/cub.webp"
                    alt="Cheetah Cub 4"
                    className="w-12 h-10 sm:w-14 sm:h-12 md:w-16 md:h-14 animate-bounce-gentle"
                    style={{ animationDelay: '1.4s' }}
                  />
                </div>
              </div>
            </div>

            {/* Game description with enhanced card and better mobile typography */}
            <div className="max-w-2xl mx-auto animate-fade-in backdrop-blur-sm bg-background/80 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/20" style={{ animationDelay: '0.9s' }}>
              <p className="text-lg sm:text-xl text-on-surface-variant leading-relaxed font-medium text-center">
                کمک  کن یوزپلنگ مادر بتواند در 18 ماه،<br /> 4 توله اش را در شرایط سخت به استقلال برساند
              </p>
            </div>
          </>
        )}

        {/* Cheetah Educational Info */}
        {showBasicInfo && isLoaded && (
          <div className="md-card max-w-5xl mx-auto animate-fade-in backdrop-blur-sm bg-background/95 p-6 max-h-[80vh] overflow-y-auto mt-4" style={{ animationDelay: '0.3s' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <button
                onClick={() => setShowBasicInfo(false)}
                className="md-filled-button bg-secondary hover:bg-secondary/90 text-secondary-foreground px-6 py-2.5 text-base font-medium transition-colors flex items-center gap-2 shadow-md"
              >
                <span>←</span>
                بازگشت به منوی اصلی
              </button>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800  text-center">
                آموزش و حفاظت از یوزپلنگ آسیایی
              </h3>
              <div className="w-8"></div> {/* Spacer for centering */}
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {/* وضعیت یوزپلنگ ایرانی */}
              <AccordionItem value="cheetah-status" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 bg-gray-100 text-right transition-colors">
                  <div className="flex items-center space-x-3 space-x-reverse w-full">
                    <div className="w-10 h-10 bg-red-700 dark:bg-red-600 rounded-full flex items-center justify-center text-white text-xl">🐆</div>
                    <div className="text-right flex-1">
                      <h3 className="font-bold text-lg">وضعیت یوزپلنگ آسیایی</h3>
                      <p className="text-sm text-gray-700  mt-0.5">جمعیت، پراکندگی و چالش‌های کنونی</p>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down transition-transform duration-200">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-1 py-2">
                  <div className="space-y-5 text-right">
                    <div className="bg-red-50 dark:bg-red-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">وضعیت بحرانی</h4>
                      <p className="text-sm leading-relaxed mb-3">
                        یوزپلنگ آسیایی (Acinonyx jubatus venaticus) یکی از نادرترین زیرگونه‌های یوزپلنگ در جهان است.
                        این گونه در فهرست IUCN به عنوان "به شدت در معرض انقراض" (Critically Endangered) قرار دارد.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium text-red-600">جمعیت در جهان</div>
                          <div className="text-2xl font-bold">فقط در ایران </div>
                          <div className="text-xs text-muted-foreground"><strong>منقرض شده در دیگر نقاط</strong></div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 rounded">
                          <div className="font-medium text-red-600">در ایران</div>
                          <div className="text-2xl font-bold">۲۰-۳۰</div>
                          <div className="text-xs text-muted-foreground">فرد</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-orange-700 dark:text-orange-400">زیستگاه‌های باقی‌مانده</h4>
                      <ul className="space-y-2 text-sm">
                        <li>•  <strong>استان سمنان:</strong> زیستگاه اصلی با جمعیت حدود ۲۰ یوز</li>
                        <li>•  <strong>استان خراسان شمالی:</strong> جمعیت کوچکتر وابسته به جمعیت سمنان</li>
                        <li>•  <strong>استان خراسان رضوی:</strong>  جمعیت بسیار محدود و گذری</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/10 p-4 rounded-lg">
                      <h4 className="font-bold text-lg mb-4 text-yellow-700 dark:text-yellow-400 flex items-center gap-2">علل کاهش جمعیت</h4>
                      <p className="text-sm leading-relaxed">
                        جمعیت یوزپلنگ آسیایی از حدود ۱۰۰-۲۰۰ فرد در دهه ۱۹۷۰ به کمتر از ۳۰ فرد در سال ۲۰۲۴ کاهش یافته است.
                        این کاهش شدید به دلیل ترکیب عوامل انسانی و طبیعی رخ داده است.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* تهدیدها و عوامل */}
              <AccordionItem value="threats-factors" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">⚠️</div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">تهدیدها و عوامل تأثیرگذار</h3>
                      <p className="text-sm text-muted-foreground">تمام عوامل تهدیدکننده یوزپلنگ آسیایی</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-1 py-2">
                  <div className="space-y-5 text-right">
                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>🛣️</span>
                        <span>جاده‌ها و تصادفات</span>
                      </h4>
                      <p className="text-sm leading-relaxed mb-3">
                        جاده‌ها یکی از بزرگترین تهدیدها برای یوزپلنگ هستند. تعداد زیادی یوزپلنگ در تصادفات جاده‌ای کشته شده‌اند.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>•  جاده‌های اصلی مانند تهران-مشهد</li>
                        <li>•  نبود پل‌های حیات‌وحش و زیرگذرها</li>
                        <li>•  سرعت بالا و ترافیک سنگین</li>
                        <li>•  تخریب زیستگاه به دلیل ساخت جاده</li>
                      </ul>
                    </div>

                    <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>🏹</span>
                        <span>شکار غیرقانونی</span>
                      </h4>
                      <p className="text-sm leading-relaxed mb-3">
                        شکارچیان غیرمجاز جمعیت طعمه‌های یوز را به شدت کاهش داده‌اند.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>•  شکار غیرمجاز آهو</li>
                        <li>•   کمبود نظارت و کنترل شکار به دلیل کمبود محیط‌بان</li>
                      </ul>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>🐕</span>
                        <span>سگ‌های گله و سگ‌های رها شده</span>
                      </h4>
                      <p className="text-sm leading-relaxed mb-3">
                        سگ‌های گله و سگ‌های رها شده یکی از جدی‌ترین تهدیدها برای توله‌های یوزپلنگ هستند.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>•  حمله به توله‌های یوزپلنگ</li>
                        <li>•  رقابت سگ‌های رها شده برای طعمه با یوزهای بالغ</li>
                        <li>•  گسترش بیماری‌های مشترک</li>
                        <li>•  جمعیت رو به رشد سگ‌های رها شده</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>🏜️</span>
                        <span>حضور شترهای رها شده در زیستگاه های یوزپلنگ</span>
                      </h4>
                      <p className="text-sm leading-relaxed mb-3">
                        دامداری و شترداری بی رویه باعث تخریب بیشتر زیستگاه‌ها شده
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>•  رقابت بر سر منابع آبی با شتر</li>
                        <li>•  کاهش جمعیت طعمه یوزپلنگ بر اثر کاهش مراتع و منابع غذایی</li>
                        <li>•  تشدید اثر تغییر اقلیم و خشکسالی</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>🏗️</span>
                        <span>تخریب زیستگاه</span>
                      </h4>
                      <p className="text-sm leading-relaxed mb-3">
                        گسترش کشاورزی، شهرنشینی و پروژه‌های صنعتی زیستگاه‌های یوزپلنگ را کوچک‌تر می‌کنند.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>•  تبدیل مراتع به زمین کشاورزی</li>
                        <li>•  ساخت جاده و راه‌آهن</li>
                        <li>•  استخراج معادن</li>
                        <li>•  گسترش شهرها و روستاها</li>
                        <li>•  کاهش طعمه یوزپلنگ</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                        <span>🌡️</span>
                        <span>تغییرات اقلیمی</span>
                      </h4>
                      <p className="text-sm leading-relaxed mb-3">
                        خشکسالی‌های شدید و تغییرات آب و هوایی بر منابع غذایی و آب یوزپلنگ تأثیر می‌گذارد.
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>•  کاهش منابع آب</li>
                        <li>•  کاهش پوشش گیاهی</li>
                        <li>•  کاهش جمعیت طعمه</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* حفاظت و راهکارها */}
              <AccordionItem value="protection-solutions" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">🛡️</div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg">حفاظت و راهکارها</h3>
                      <p className="text-sm text-muted-foreground">چه کاری می‌توانیم برای نجات یوزپلنگ انجام دهیم</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 text-right">
                    <div className="bg-green-50 dark:bg-green-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">اقدامات دولتی و سازمانی</h4>
                      <ul className="space-y-2 text-sm">
                        <li>•  <strong>ایمن سازی محل های عبور یوزپلنگ بین زیستگاه ها</strong></li>
                        <li>•  <strong>ساخت پل های هوایی ماشین رو در محل های داغ عبور یوزپلنگ بر روی جاده تهران- مشهد</strong></li>
                        <li>•  <strong>کنترل جمعیت سگ های گله و مدیریت و کنترل واکسیناسیون دام های موجود در زیستگاه ها</strong></li>
                        <li>•  <strong>نظارت الکترونیکی از طریق دوربین های تله ای و ردیاب های ماهواره ای</strong></li>
                        <li>•  <strong>آموزش و مشارکت جوامع محلی برای حفاظت از یوزپلنگ</strong></li>
                        <li>•  <strong>تقویت قوانین حفاظت و مجازات کارآمد و تاثیر گذار برای شکار غیرمجاز</strong></li>
                        <li>•  <strong>افزایش توان حفاظتی با افزایش تعداد نیروی محیط بان</strong></li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">اقدامات فردی شما</h4>
                      <ul className="space-y-2 text-sm">
                        <li>•  <strong>رانندگی با سرعت مطمئن در محل های عبور یوزپلنگ و گزارش تصادف یوزپلنگ در صورت مشاهده</strong></li>
                        <li>•  <strong>کمک مالی به پروژه های حفاظتی و حمایت از سازمان های مستقل مردمی</strong></li>
                        <li>•  <strong>آگاهی رسانی و اشتراک گذاری اطلاعات از منابع معتبر در شبکه های اجتماعی</strong></li>
                        <li>•  <strong>اجتناب از خرید محصولات شکار و غیرقانونی</strong></li>
                        <li>•  <strong>اطلاع رسانی شکار غیر قانونی به مسئولین سازمان حفاظت محیط زیست</strong></li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-950/10 p-4 rounded-lg">
                      <h4 className="font-bold text-lg mb-4 text-yellow-700 dark:text-yellow-400 flex items-center gap-2">چشم‌انداز آینده</h4>
                      <p className="text-sm leading-relaxed mb-3">
                        با اقدامات مناسب و حمایت عمومی، می‌توان جمعیت یوزپلنگ آسیایی را از وضعیت بحرانی خارج کرد.
                        هر فرد با اقدامات کوچک خود می‌تواند به نجات این گونه ارزشمند کمک کند.
                      </p>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                        <div className="text-lg font-bold text-green-600 mb-1">هدف ۱۰ ساله</div>
                        <div className="text-sm">افزایش جمعیت به بالای ۳۰ یوزپلنگ در طبیعت</div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Action buttons with enhanced styling and animations - only show when not showing educational info */}
        {!showBasicInfo && (
          <div className="space-y-4 sm:space-y-6 animate-fade-in" style={{ animationDelay: '1.1s' }}>
          {/* Primary action button with enhanced effects */}
          <button
            onClick={onStartGame}
            className="md-filled-button w-full max-w-sm mx-auto text-lg sm:text-xl font-bold py-4 sm:py-5 px-8 sm:px-10 md-motion-emphasized shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-primary hover:bg-primary/90 relative overflow-hidden group"
            data-testid="button-start-game"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="text-2xl">🎮</span>
              شروع بازی
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Cheetah educational info button */}
          <button
            onClick={() => {
              trackEducationalVisit(getDeviceType());
              setShowBasicInfo(!showBasicInfo);
            }}
            className="md-filled-button w-full max-w-sm mx-auto px-6 sm:px-8 py-4 sm:py-5 font-semibold text-base sm:text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
            data-testid="button-cheetah-info"
          >
            <span className="text-xl">📚</span>
            اطلاعات آموزشی یوزپلنگ
          </button>

          {/* Download story button for returning users */}
          {bestScore && onDownloadStory && (
            <button
              onClick={() => onDownloadStory(bestScore)}
              className="md-filled-button w-full max-w-sm mx-auto text-base sm:text-lg font-semibold py-4 sm:py-5 px-6 sm:px-8 bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse-gentle"
              data-testid="button-download-story"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="text-xl">📖</span>
                دانلود استوری برای اینستاگرام
              </span>
            </button>
          )}
        </div>
        )}

        {/* Footer with enhanced styling */}
        <div className="text-center mt-4 sm:mt-6 md:mt-8 animate-fade-in" style={{ animationDelay: '1.3s' }}>
          <p className="text-base text-white font-medium bg-background/60 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
            حافظان حیات‌وحش سَروین
          </p>
          <div className="mt-4 flex justify-center space-x-6 space-x-reverse text-sm text-white/70">
            <span>نسخه ۱.۶.۰</span>
            <span>۹ شهریور ۱۴۰۴</span>
          </div>
        </div>
      </div>
    </div>
  );
}
