import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TutorialProps {
  onClose: () => void;
}

export default function Tutorial({ onClose }: TutorialProps) {
  const [activeSection, setActiveSection] = useState<string>("game-tutorial");

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" data-testid="tutorial-overlay">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-3xl font-bold text-primary text-center mb-2">آموزش و حفاظت از یوزپلنگ ایرانی</h2>
          <p className="text-secondary text-center text-sm">آموزش کامل بازی و آگاهی از وضعیت یوزپلنگ آسیایی</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="game-tutorial">
            {/* آموزش بازی */}
            <AccordionItem value="game-tutorial" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">🎮</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">آموزش بازی</h3>
                    <p className="text-sm text-muted-foreground">نحوه بازی کردن و کنترل‌های پایه</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  <div className="bg-accent/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🎯 هدف بازی</h4>
                    <p className="text-sm leading-relaxed">
                      شما نقش مادر یوزپلنگ را دارید که باید ۴ توله خود را در مدت ۱۸ ماه به استقلال برسانید.
                      از موانع دوری کنید، منابع غذایی جمع‌آوری کنید و خانواده را سالم نگه دارید.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                      <div>
                        <h5 className="font-medium">حرکت و کنترل</h5>
                        <p className="text-sm text-muted-foreground">با لمس و کشیدن چپ-راست مادر یوز را بین ۴ مسیر هدایت کنید</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                      <div>
                        <h5 className="font-medium">جمع‌آوری منابع</h5>
                        <p className="text-sm text-muted-foreground">آب، آهو و خرگوش جمع‌آوری کنید تا سلامتی خانواده حفظ شود</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex-shrink-0 mt-1"></div>
                      <div>
                        <h5 className="font-medium">دوری از موانع</h5>
                        <p className="text-sm text-muted-foreground">از سگ‌ها، قاچاقچیان توله‌ها، شترها و جاده‌ها دوری کنید</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* مکانیک‌های بازی */}
            <AccordionItem value="game-mechanics" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">⚙️</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">مکانیسم بازی</h3>
                    <p className="text-sm text-muted-foreground">جزئیات سیستم امتیازدهی، زمان و سلامتی</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-6 text-right">
                  {/* سیستم زمان */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>⏰</span>
                      <span>سیستم زمان</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• مدت بازی: ۱۲۰ ثانیه = ۱۸ ماه</li>
                      <li>• هر ماه: ۶-۸ ثانیه</li>
                      <li>• فصل‌ها: بهار، تابستان، پاییز، زمستان</li>
                      <li>• تغییرات محیطی بر اساس فصل</li>
                    </ul>
                  </div>

                  {/* سیستم سلامتی */}
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>❤️</span>
                      <span>سیستم سلامتی</span>
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• سلامتی اولیه: ۱۰۰ امتیاز</li>
                      <li>• کاهش مداوم: ۵ امتیاز در ثانیه</li>
                      <li>• بازی تمام می‌شود اگر سلامتی مادر به صفر برسد</li>
                      <li>• توله‌ها در سن بالا نیاز به آب و غذای بیشتر دارند و سلامتی سریع‌تر کاهش پیدا می‌کند</li>
                    </ul>
                  </div>

                  {/* منابع */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🥕</span>
                      <span>منابع غذایی</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                        <div className="text-2xl mb-1">💧</div>
                        <div className="font-medium">آب</div>
                        <div className="text-xs text-muted-foreground">+۱۵ سلامتی</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                        <div className="text-2xl mb-1">🦌</div>
                        <div className="font-medium">آهو</div>
                        <div className="text-xs text-muted-foreground">+۲۵ سلامتی</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded">
                        <div className="text-2xl mb-1">🐰</div>
                        <div className="font-medium">خرگوش</div>
                        <div className="text-xs text-muted-foreground">+۱۰ سلامتی</div>
                        <div className="text-xs text-blue-600">شارژ جهش سرعت</div>
                      </div>
                    </div>
                  </div>

                  
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* وضعیت یوزپلنگ ایرانی */}
            <AccordionItem value="cheetah-status" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">🐆</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">وضعیت یوزپلنگ ایرانی</h3>
                    <p className="text-sm text-muted-foreground">جمعیت، پراکندگی و چالش‌های کنونی</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-red-700 dark:text-red-400">وضعیت بحرانی</h4>
                    <p className="text-sm leading-relaxed mb-3">
                      یوزپلنگ آسیایی (Acinonyx jubatus venaticus) یکی از نادرترین زیرگونه‌های یوزپلنگ در جهان است.
                      این گونه در فهرست IUCN به عنوان "در معرض انقراض بسیار شدید" (Critically Endangered) قرار دارد.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="font-medium text-red-600">جمعیت جهانی</div>
                        <div className="text-2xl font-bold">فقط در </div>
                        <div className="text-xs text-muted-foreground">ایران</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded">
                        <div className="font-medium text-red-600">در ایران</div>
                        <div className="text-2xl font-bold">۲۰-۳۰</div>
                        <div className="text-xs text-muted-foreground">یوزپلنگ</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-orange-700 dark:text-orange-400">زیستگاه‌های باقی‌مانده</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>استان سمنان:</strong> زیستگاه اصلی با جمعیت حدود ۲۰ یوز</li>
                      <li>• <strong>استان خراسان شمالی:</strong> جمعیت کوچکتر وابسته به جمعیت سمنان</li>
                      <li>• <strong>استان خراسان رضوی:</strong>  جمعیت بسیار محدود و گذرری</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-yellow-700 dark:text-yellow-400">علل کاهش جمعیت</h4>
                    <p className="text-sm leading-relaxed">
                      جمعیت یوزپلنگ ایرانی از حدود ۱۰۰-۲۰۰ عدد در دهه ۱۹۷۰ به کمتر از ۳۰ عدد در سال ۲۰۲۴ کاهش یافته است.
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
                    <p className="text-sm text-muted-foreground">تمام عوامل تهدیدکننده یوزپلنگ ایرانی</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  {/* جاده‌ها و تصادفات */}
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🛣️</span>
                      <span>جاده‌ها و تصادفات</span>
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      جاده‌ها یکی از بزرگترین تهدیدها برای یوزپلنگ هستند. تعداد زیادی یوزپلنگ در تصادفات جاده‌ای کشته شده‌اند.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• جاده‌های اصلی مانند تهران-مشهد</li>
                      <li>• نبود پل‌های حیات‌وحش و زیرگذرها</li>
                      <li>• سرعت بالا و ترافیک سنگین</li>
                      <li>• تخریب زیستگاه به دلیل ساخت جاده</li>
                    </ul>
                  </div>

                  {/* شکار غیرقانونی */}
                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🏹</span>
                      <span>شکار غیرقانونی</span>
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      شکارچیان غیرمجاز جمعیت طعمه‌های یوز را به شدت کاهش داده‌اند.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• شکار غیرمجاز آهو</li>
                      <li>•  کمبود نظارت و کنترل شکار به دلیل کمبود محیط‌بان</li>
                    </ul>
                  </div>

                  {/* سگ‌های گله */}
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🐕</span>
                      <span>سگ‌های گله و سگ‌های رها شده</span>
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      سگ‌های گله و سگ‌های رها شده یکی از جدی‌ترین تهدیدها برای توله‌های یوزپلنگ هستند.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• حمله به توله‌های یوزپلنگ</li>
                      <li>• رقابت سگ‌های رها شده برای طعمه با یوزهای بالغ</li>
                      <li>• گسترش بیماری‌های مشترک</li>
                      <li>• جمعیت رو به رشد سگ‌های رها شده</li>
                    </ul>
                  </div>

                  {/* کاهش طعمه */}
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🏜️</span>
                      <span>کاهش طعمه طبیعی</span>
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      دامداری و شترداری بی رویه باعث تخریب بیشتر زیستگاه‌ها شده
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• رقابت بر سر منابع آبی با شتر</li>
                      <li>• کاهش مراتع و منابع غذایی برای طعمه‌های یوز</li>
                      <li>• تشدید اثر تغییر اقلیم و خشکسالی</li>
                    </ul>
                  </div>

                  {/* تخریب زیستگاه */}
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🏗️</span>
                      <span>تخریب زیستگاه</span>
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      گسترش کشاورزی، شهرنشینی و پروژه‌های صنعتی زیستگاه‌های یوزپلنگ را کوچک‌تر می‌کنند.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• تبدیل مراتع به زمین کشاورزی</li>
                      <li>• ساخت جاده و راه‌آهن</li>
                      <li>• استخراج معادن</li>
                      <li>• گسترش شهرها و روستاها</li>
                    </ul>
                  </div>

                  {/* تغییرات اقلیمی */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                      <span>🌡️</span>
                      <span>تغییرات اقلیمی</span>
                    </h4>
                    <p className="text-sm leading-relaxed mb-3">
                      خشکسالی‌های شدید و تغییرات آب و هوایی بر منابع غذایی و آب یوزپلنگ تأثیر می‌گذارد.
                    </p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• کاهش منابع آب</li>
                      <li>• کاهش پوشش گیاهی</li>
                      <li>• کاهش جمعیت طعمه</li>
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
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400">اقدامات دولتی و سازمانی</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>ایجاد کریدورهای حیات‌وحش:</strong> اتصال زیستگاه‌های جدا شده</li>
                      <li>• <strong>ساخت پل‌های حیات‌وحش:</strong> روی جاده‌های اصلی</li>
                      <li>• <strong>کنترل جمعیت سگ‌های گله:</strong> مدیریت و واکسیناسیون</li>
                      <li>• <strong>نظارت الکترونیکی:</strong> دوربین‌های تله و GPS</li>
                      <li>• <strong>آموزش جوامع محلی:</strong> آگاهی از اهمیت حفاظت</li>
                      <li>• <strong>تقویت قوانین حفاظت:</strong> مجازات شدید برای شکار غیرمجاز</li>
                      <li>• <strong>افزایش توان حفاظتی:</strong> افزایش تعداد محیط‌بان</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400">اقدامات فردی شما</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>رانندگی ایمن:</strong> کاهش سرعت در مناطق یوز، گزارش تصادفات</li>
                      <li>• <strong>پشتیبانی از سازمان‌ها:</strong> کمک مالی به پروژه‌های حفاظتی</li>
                      <li>• <strong>آگاهی‌رسانی:</strong> اشتراک‌گذاری اطلاعات در شبکه‌های اجتماعی</li>
                      <li>• <strong>مصرف مسئولانه:</strong> اجتناب از محصولات شکار غیرقانونی</li>
                      <li>• <strong>گزارش موارد:</strong> اطلاع‌رسانی شکار غیرقانونی به authorities</li>
                    </ul>
                  </div>


                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-yellow-700 dark:text-yellow-400">چشم‌انداز آینده</h4>
                    <p className="text-sm leading-relaxed mb-3">
                      با اقدامات مناسب و حمایت عمومی، می‌توان جمعیت یوزپلنگ ایرانی را از وضعیت بحرانی خارج کرد.
                      هر فرد با اقدامات کوچک خود می‌تواند به نجات این گونه ارزشمند کمک کند.
                    </p>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded text-center">
                      <div className="text-lg font-bold text-green-600 mb-1">هدف ۲۰۳۰</div>
                      <div className="text-sm">افزایش جمعیت به ۵۰ یوزپلنگ در طبیعت</div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-accent/20">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-all duration-200"
              data-testid="button-close-tutorial"
            >
              متوجه شدم، شروع بازی!
            </button>
            <div className="text-sm text-muted-foreground text-center">
              <div>با بازی کردن به حفاظت از یوزپلنگ کمک کنید</div>
              <div className="text-xs mt-1">هر اشتراک‌گذاری = یک گام به سوی نجات</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
