import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TutorialProps {
  onClose: () => void;
  onSkip?: () => void;
}

export default function Tutorial({ onClose, onSkip }: TutorialProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4" data-testid="tutorial-overlay">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-3xl font-bold text-primary text-center mb-2">آموزش بازی حفاظت از یوزپلنگ</h2>
          <p className="text-secondary text-center text-sm">راهنمایی برای شروع بازی و یادگیری مکانیک‌ها</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Accordion type="multiple" className="w-full space-y-4" value={expandedSections} onValueChange={setExpandedSections}>
            {/* تهدیدها که باید از آن‌ها دوری کنید */}
            <AccordionItem value="threats" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">⚠️</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">تهدیدها که باید از آن‌ها دوری کنید</h3>
                    <p className="text-sm text-muted-foreground">موانعی که باعث آسیب یا مرگ می‌شوند</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  <p className="text-sm leading-relaxed bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
                    نزدیک شدن به این تهدیدها باعث کاهش شدید سلامتی، آسیب یا حتی مرگ مادر یوزپلنگ و توله‌ها می‌شود.
                    همیشه فاصله خود را حفظ کنید و از مسیرهای امن استفاده نمایید.
                    <br /><br />
                    <strong className="text-yellow-600">نکته مهم:</strong> برخی تهدیدها مانند شتر فقط سلامتی را کاهش می‌دهند (۳۰٪) و باعث مرگ نمی‌شوند، اما همچنان باید از آن‌ها دوری کنید.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg shadow-md border-2 border-red-200">
                      <img src="/assets/sprites/obstacles/pocher.png" alt="Poacher" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-red-600">قاچاقچی</div>
                      <div className="text-xs text-muted-foreground">شکارچی غیرقانونی</div>
                      <div className="text-xs text-red-500 font-medium mt-1">⚠️ بسیار خطرناک!</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <img src="/assets/sprites/obstacles/dog.png" alt="Dog" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-red-600">سگ</div>
                      <div className="text-xs text-muted-foreground">سگ گله یا رها شده</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <img src="/assets/sprites/obstacles/car.png" alt="Car" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-red-600">ماشین</div>
                      <div className="text-xs text-muted-foreground">جاده‌های خطرناک</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg shadow-md border-2 border-yellow-200">
                      <img src="/assets/sprites/obstacles/camel.png" alt="Camel" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-yellow-600">شتر</div>
                      <div className="text-xs text-muted-foreground">حیوانات وحشی - کاهش سلامتی</div>
                      <div className="text-xs text-yellow-600 font-medium mt-1">⚠️ کاهش ۳۰٪ سلامتی</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleSection('threats-more')}
                      className="bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      اطلاعات بیشتر درباره تهدیدها
                    </button>
                  </div>

                  {expandedSections.includes('threats-more') && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <h5 className="font-semibold mb-2">نکات مهم:</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• قاچاقچیان معمولاً در مناطق مرزی و جنگلی حضور دارند</li>
                        <li>• سگ‌های گله اغلب در مناطق کشاورزی دیده می‌شوند</li>
                        <li>• جاده‌ها در ساعات شب خطرناک‌تر هستند</li>
                        <li>• شترها ممکن است در مسیرهای آبی حضور داشته باشند</li>
                        <li className="text-yellow-600 font-medium">• شترها باعث کاهش ۳۰٪ سلامتی می‌شوند اما مرگ آور نیستند</li>
                        <li className="text-yellow-600 font-medium">• برخورد با شتر باعث فلش صفحه برای یک ثانیه می‌شود</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* منابع غذایی که باید مصرف کنید */}
            <AccordionItem value="resources" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">🥕</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">منابع غذایی که باید مصرف کنید</h3>
                    <p className="text-sm text-muted-foreground">منابع حیاتی برای حفظ سلامتی خانواده</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-yellow-700 dark:text-yellow-400">نمودار سلامتی</h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-center mb-4">
                        <svg width="120" height="60" viewBox="0 0 120 60" className="drop-shadow-md">
                          <rect x="10" y="20" width="100" height="20" fill="#e5e7eb" rx="10"/>
                          <rect x="10" y="20" width="80" height="20" fill="#10b981" rx="10"/>
                          <text x="60" y="15" textAnchor="middle" className="text-xs font-semibold fill-gray-700">سلامتی خانواده</text>
                          <text x="60" y="50" textAnchor="middle" className="text-xs fill-gray-500">۱۰۰/۱۰۰</text>
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-red-600 font-semibold mb-2">⚠️ حواستان به سلامتی خانواده باشد!</p>
                        <p className="text-xs text-muted-foreground">کاهش مداوم: ۵ امتیاز در ثانیه - همیشه منابع غذایی را پیگیری کنید</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-semibold mb-2 text-red-700 dark:text-red-400">⚠️ هشدارهای حیاتی</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2 space-x-reverse">
                        <span className="text-red-500 mt-1">•</span>
                        <span>دریافت منظم آب و غذا ضروری است</span>
                      </li>
                      <li className="flex items-start space-x-2 space-x-reverse">
                        <span className="text-red-500 mt-1">•</span>
                        <span>در صورت کاهش سلامتی، انرژی کاهش یافته و آسیب می‌بینید</span>
                      </li>
                      <li className="flex items-start space-x-2 space-x-reverse">
                        <span className="text-red-500 mt-1">•</span>
                        <span>بیماری یا مرگ در صورت عدم مراقبت مناسب</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <img src="/assets/sprites/resources/water.png" alt="Water" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-blue-600">آب</div>
                      <div className="text-xs text-muted-foreground">+۱۵ سلامتی</div>
                      <div className="text-xs text-green-600">منبع حیاتی</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <img src="/assets/sprites/resources/gazelle.png" alt="Gazelle" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-green-600">آهو</div>
                      <div className="text-xs text-muted-foreground">+۲۵ سلامتی</div>
                      <div className="text-xs text-orange-600">منبع غذایی اصلی</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                      <img src="/assets/sprites/resources/rabbit.png" alt="Rabbit" className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-semibold text-purple-600">خرگوش</div>
                      <div className="text-xs text-muted-foreground">+۱۰ سلامتی</div>
                      <div className="text-xs text-blue-600">شارژ جهش سرعت</div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleSection('resources-more')}
                      className="bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      اطلاعات بیشتر درباره منابع
                    </button>
                  </div>

                  {expandedSections.includes('resources-more') && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h5 className="font-semibold mb-2">نکات تغذیه:</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• آب را در منابع آبی و چشمه‌ها پیدا کنید</li>
                        <li>• آهو در مناطق جنگلی و مراتع حضور دارد</li>
                        <li>• خرگوش علاوه بر تغذیه، قدرت جهش سرعت می‌دهد</li>
                        <li>• در فصل‌های مختلف، منابع تغییر می‌کنند</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* تأثیر تغییر فصل‌ها */}
            <AccordionItem value="seasons" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">🌸</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">تأثیر تغییر فصل‌ها</h3>
                    <p className="text-sm text-muted-foreground">چگونه فصل‌ها بر منابع و خطرات تأثیر می‌گذارند</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  <p className="text-sm leading-relaxed bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    منابع و خطرات در هر فصل تغییر می‌کنند. استراتژی خود را بر اساس فصل تنظیم کنید تا خانواده را سالم نگه دارید.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <img src="/assets/backgrounds/spring-bg.png" alt="Spring" className="w-full h-24 object-cover rounded-lg mb-2" />
                      <div className="font-semibold text-green-600">بهار</div>
                      <div className="text-xs text-muted-foreground">منابع فراوان، آب زیاد</div>
                    </div>
                    <div className="text-center">
                      <img src="/assets/backgrounds/summer-bg.png" alt="Summer" className="w-full h-24 object-cover rounded-lg mb-2" />
                      <div className="font-semibold text-yellow-600">تابستان</div>
                      <div className="text-xs text-muted-foreground">گرمای شدید، آب کمتر</div>
                    </div>
                    <div className="text-center">
                      <img src="/assets/backgrounds/autumn-bg.png" alt="Autumn" className="w-full h-24 object-cover rounded-lg mb-2" />
                      <div className="font-semibold text-orange-600">پاییز</div>
                      <div className="text-xs text-muted-foreground">شکار آسان، باد شدید</div>
                    </div>
                    <div className="text-center">
                      <img src="/assets/backgrounds/winter-bg.png" alt="Winter" className="w-full h-24 object-cover rounded-lg mb-2" />
                      <div className="font-semibold text-blue-600">زمستان</div>
                      <div className="text-xs text-muted-foreground">سرما شدید، منابع محدود</div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">تغییرات فصلی:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-green-600">منابع در فصل خشک:</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• آب کمتر موجود است</li>
                          <li>• طعمه‌ها کمتر دیده می‌شوند</li>
                          <li>• نیاز به جستجوی بیشتر</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-red-600">خطرات در فصل خشک:</h5>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• گرمای بیش از حد</li>
                          <li>• کم‌آبی و ضعف</li>
                          <li>• شکارچیان فعال‌تر</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleSection('seasons-more')}
                      className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      اطلاعات بیشتر درباره فصل‌ها
                    </button>
                  </div>

                  {expandedSections.includes('seasons-more') && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h5 className="font-semibold mb-2">استراتژی‌های فصلی:</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• در تابستان: بیشتر در سایه بمانید و آب را اولویت دهید</li>
                        <li>• در زمستان: از مناطق گرم‌تر استفاده کنید</li>
                        <li>• در بهار: از فراوانی منابع برای ذخیره انرژی استفاده کنید</li>
                        <li>• در پاییز: باد را در جهت شکار استفاده کنید</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* کنترل‌های بازی */}
            <AccordionItem value="controls" className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:bg-accent/50 text-right">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">🎮</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg">کنترل‌های بازی</h3>
                    <p className="text-sm text-muted-foreground">نحوه کنترل مادر یوزپلنگ و تعامل با محیط</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 text-right">
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-purple-700 dark:text-purple-400">کنترل‌های پایه</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">👆</div>
                        <div>
                          <h5 className="font-medium">حرکت</h5>
                          <p className="text-sm text-muted-foreground">با لمس و کشیدن صفحه، مادر یوز را بین ۴ مسیر جابجا کنید</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">🎯</div>
                        <div>
                          <h5 className="font-medium">جمع‌آوری منابع</h5>
                          <p className="text-sm text-muted-foreground">وقتی به منابع نزدیک شدید، به طور خودکار جمع‌آوری می‌شوند</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">⚡</div>
                        <div>
                          <h5 className="font-medium">جهش سرعت</h5>
                          <p className="text-sm text-muted-foreground">با خوردن خرگوش، قدرت جهش سرعت فعال می‌شود</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">👁️</div>
                        <div>
                          <h5 className="font-medium">مشاهده محیط</h5>
                          <p className="text-sm text-muted-foreground">مراقب تهدیدها و منابع در مسیر خود باشید</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-950/20 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🎯 هدف بازی</h4>
                    <p className="text-sm leading-relaxed">
                      شما نقش مادر یوزپلنگ را دارید که باید ۴ توله خود را در مدت ۱۸ ماه به استقلال برسانید.
                      از موانع دوری کنید، منابع غذایی جمع‌آوری کنید و خانواده را سالم نگه دارید.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={() => toggleSection('controls-more')}
                      className="bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      اطلاعات بیشتر درباره کنترل‌ها
                    </button>
                  </div>

                  {expandedSections.includes('controls-more') && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <h5 className="font-semibold mb-2">نکات پیشرفته:</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• از جهش سرعت برای فرار از تهدیدها استفاده کنید</li>
                        <li>• مسیرها را strategic انتخاب کنید تا منابع بیشتری پیدا کنید</li>
                        <li>• در فصل‌های مختلف، مسیرهای متفاوتی را امتحان کنید</li>
                        <li>• توله‌ها با بزرگ شدن نیازهای بیشتری دارند</li>
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-accent/20">
          <div className="flex justify-between items-center">
            {onSkip && (
              <button
                onClick={onSkip}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 mr-4"
                data-testid="button-skip-tutorial"
              >
                رد کردن آموزش
              </button>
            )}
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-all duration-200"
              data-testid="button-close-tutorial"
            >
              متوجه شدم، شروع بازی!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
