# 🎯 Game Mechanics Documentation

مستندات مکانیک‌های بازی نجات یوز ایران

## 📋 نمای کلی

بازی نجات یوز ایران یک vertical scroller است که از مکانیک‌های ساده اما جذاب استفاده می‌کند تا پیام حفاظت از یوزپلنگ آسیایی را منتقل کند.

## 🐾 شخصیت‌ها و موجودیت‌ها

### مادر یوزپلنگ (Player Character)

**ویژگی‌ها:**
- **حرکت**: کنترل با لمس/کلیک چپ و راست
- **سرعت پایه**: ۲۰۰ پیکسل بر ثانیه
- **سرعت در سلامتی کم**: ۵۰% کاهش (۱۰۰ پیکسل بر ثانیه)
- **سلامتی**: ۱۰۰ امتیاز اولیه
- **اندازه**: ۶۴×۴۸ پیکسل (بهبود یافته برای دید بهتر)

**مکانیک حرکت:**
```typescript
// تغییر مسیر
function changeLane(scene: GameScene, newLane: number) {
  const targetX = scene.lanes[newLane];
  scene.tweens.add({
    targets: scene.motherCheetah,
    x: targetX,
    duration: 200,
    ease: 'Power2'
  });
}
```

### توله‌های یوز (Cubs)

**ویژگی‌ها:**
- **تعداد**: ۴ توله
- **حرکت**: دنبال کردن مادر با تأخیر
- **اندازه**: ۴۰×۲۸ پیکسل (بهبود یافته)
- **انیمیشن**: حرکت ملایم و pulsing

**مکانیک دنبال کردن:**
```typescript
// توله‌ها مادر را دنبال می‌کنند
scene.cubs.forEach((cub, index) => {
  scene.tweens.add({
    targets: cub,
    x: targetX + (index % 2 === 0 ? -25 : 25),
    duration: 250 + (index * 50),
    ease: 'Power2'
  });
});
```

## 🏞️ محیط بازی

### مسیرها (Lanes)

**ویژگی‌ها:**
- **تعداد**: ۴ مسیر موازی
- **فواصل**: ۱۲۰، ۲۴۰، ۳۶۰، ۴۸۰ پیکسل از سمت چپ
- **عرض**: ۱۲۰ پیکسل هر مسیر
- **نمایان‌سازی**: خطوط راهنما در UI

### پس‌زمینه‌ها (Backgrounds)

**سیستم پویا:**
- **۴ فصل**: بهار، تابستان، پاییز، زمستان
- **تغییر خودکار**: هر ۶-۸ ثانیه (ماه جدید)
- **scaling**: responsive برای تمام اندازه صفحه‌ها

**تغییر فصل:**
```typescript
function updateSeason(scene: GameScene) {
  const month = scene.gameData.currentMonth;
  if (month <= 3 || (month >= 13 && month <= 15)) {
    scene.gameData.season = 'spring';
  } else if (month <= 6 || (month >= 16 && month <= 18)) {
    scene.gameData.season = 'summer';
  } else if (month <= 9) {
    scene.gameData.season = 'autumn';
  } else {
    scene.gameData.season = 'winter';
  }
}
```

## ⚔️ موانع (Obstacles)

### انواع موانع

#### ۱. شترها (Camels)
```typescript
// شتر دارای منطقه هشدار زرد و مرگ قرمز است
// منطقه هشدار: کاهش ۳۰% سلامتی مادر/توله
// منطقه مرگ: پایان بازی برای مادر، مرگ توله
const camelInfo = {
  type: 'camel',
  texture: 'camel-obstacle',
  warningZone: true,      // منطقه هشدار زرد
  deathZone: false,       // بدون منطقه مرگ مستقیم
  healthDamage: 30,       // کاهش سلامتی در منطقه هشدار
  cooldown: 3000          // cooldown ۳ ثانیه بین آسیب‌ها
};
```

#### ۲. شکارچیان (Poachers/Smugglers)
```typescript
// شکارچی دارای منطقه مرگ قرمز است
const smugglerInfo = {
  type: 'smuggler',
  texture: 'smuggler-obstacle',
  warningZone: false,
  deathZone: true,        // منطقه مرگ قرمز
  instantDeath: true      // مرگ فوری
};
```

#### ۳. سگ‌ها (Dogs)
```typescript
// سگ دارای منطقه مرگ قرمز است
const dogInfo = {
  type: 'dog',
  texture: 'dog-obstacle',
  warningZone: false,
  deathZone: true,        // منطقه مرگ قرمز
  instantDeath: true      // مرگ فوری
};
```

#### ۴. جاده‌ها و ماشین‌ها (Roads & Cars)
```typescript
// جاده‌ها خود خطر ندارند اما ماشین‌ها مرگبار هستند
const roadInfo = {
  type: 'road',
  texture: 'road-surface',
  spansAllLanes: true,    // امتداد تمام مسیرها
  cars: {
    count: '2-6',        // تعداد ماشین‌ها در هر جاده
    movement: 'right-to-left', // جهت حرکت
    speed: 'base + 30',  // سرعت پایه + ۳۰
    lethal: true         // برخورد = مرگ فوری
  }
};
```

### مکانیک برخورد

**برخورد با مادر:**

**شتر (منطقه هشدار):**
```typescript
// کاهش ۳۰% سلامتی با cooldown ۳ ثانیه
scene.physics.add.overlap(scene.motherCheetah, camelWarningZone, () => {
  if (timeSinceLastDamage >= 3000) {
    const healthReduction = Math.floor(scene.gameData.health * 0.3);
    scene.gameData.health = Math.max(0, scene.gameData.health - healthReduction);
    lastDamageTime = Date.now();
  }
});
```

**شکارچی/سگ/ماشین (منطقه مرگ):**
```typescript
// مرگ فوری
scene.physics.add.overlap(scene.motherCheetah, deathZone, () => {
  scene.audioManager?.onHitObstacle(obstacleInfo.type);
  endGame(scene, obstacleInfo.type);
});
```

**برخورد با توله:**

**شتر (منطقه هشدار):**
```typescript
// کاهش ۳۰% سلامتی مادر (توله‌ها آسیب مستقیم نمی‌بینند)
scene.cubs.forEach((cub, index) => {
  scene.physics.add.overlap(cub, camelWarningZone, () => {
    if (timeSinceLastDamage >= 3000) {
      const healthReduction = Math.floor(scene.gameData.health * 0.3);
      scene.gameData.health = Math.max(0, scene.gameData.health - healthReduction);
      lastDamageTime = Date.now();
    }
  });
});
```

**شکارچی/سگ/ماشین (منطقه مرگ):**
```typescript
// مرگ توله
scene.cubs.forEach((cub, index) => {
  scene.physics.add.overlap(cub, deathZone, () => {
    scene.gameData.cubs--;
    cub.destroy();
    scene.cubs.splice(index, 1);

    if (scene.gameData.cubs === 0) {
      endGame(scene, 'all_cubs_lost');
    }
  });
});
```

## 🎁 منابع (Resources)

### انواع منابع

#### ۱. آب (Water)
```typescript
const resourceInfo = {
  type: 'water',
  texture: 'water-resource-pixel',
  healthGain: 15,
  points: 150
};
```

#### ۲. غزاله (Gazelle)
```typescript
const resourceInfo = {
  type: 'gazelle',
  texture: 'gazelle-resource-pixel',
  healthGain: 25,
  points: 250
};
```

#### ۳. خرگوش (Rabbit)
```typescript
const resourceInfo = {
  type: 'rabbit',
  texture: 'rabbit-resource-pixel',
  healthGain: 10,
  points: 100
};
```

### مکانیک جمع‌آوری

**جمع‌آوری منابع:**
```typescript
scene.physics.add.overlap(scene.motherCheetah, resource, () => {
  collectResource(scene, resourceInfo.type);
  resource.destroy();
});
```

**افزایش سلامتی:**
```typescript
function collectResource(scene: GameScene, type: string) {
  const resourceConfig = GAME_ASSETS.resources.types.find(r => r.type === type);
  const healthGain = resourceConfig?.healthGain || 0;

  scene.gameData.health = Math.min(100, scene.gameData.health + healthGain);
  scene.gameData.score += healthGain * 10;
}
```


## ⏰ سیستم زمان و پیشرفت

### چرخه زمانی

**کل مدت بازی:** نامحدود - تا رسیدن به ماه ۱۸

**تقسیم زمانی:**
- **هر ماه**: ۶-۸ ثانیه واقعی
- **هر فصل**: ۳ ماه
- **تغییر فصل**: خودکار با ماه جدید
- **پایان بازی**: رسیدن به ماه ۱۸ یا مرگ تمام خانواده

### پیشرفت بازی

**شاخص‌های پیشرفت:**
- **ماه فعلی**: ۱ تا ۱۸
- **فصل فعلی**: بر اساس ماه
- **سلامتی خانواده**: نوار سلامتی (۰-۱۰۰)
- **امتیاز کل**: مجموع امتیازات
- **تعداد توله‌های زنده**: ۰-۴

## 🏆 سیستم امتیازدهی

### منابع امتیاز

**امتیاز پایه:**
- آب: سلامتی × ۱۰ امتیاز
- غزاله: سلامتی × ۱۰ امتیاز
- خرگوش: سلامتی × ۱۰ امتیاز

**امتیاز زنده ماندن:**
- هر توله زنده = ۱۰۰ امتیاز
- تمام توله‌ها زنده = جایزه ۵۰۰ امتیاز

### محاسبه نهایی

```typescript
function collectResource(scene: GameScene, type: string) {
  const resourceConfig = GAME_ASSETS.resources.types.find(r => r.type === type);
  const healthGain = resourceConfig?.healthGain || 0;

  scene.gameData.health = Math.min(100, scene.gameData.health + healthGain);
  scene.gameData.score += healthGain * 10; // امتیاز = سلامتی به دست آمده × ۱۰
}

const finalScore = scene.gameData.score +
  (scene.gameData.cubs * 100) + // ۱۰۰ امتیاز برای هر توله زنده
  (scene.gameData.cubs === 4 ? 500 : 0); // جایزه کامل
```

## 🎨 جلوه‌های بصری

### انیمیشن‌ها

**کاراکترها:**
- حرکت ملایم بین مسیرها
- انیمیشن دنبال کردن توله‌ها
- pulsing effect برای توله‌ها
- glow effect برای مادر

**UI:**
- نوارهای پیشرفت با انیمیشن
- هشدارهای سلامتی با کاهش سرعت و تاری
- انیمیشن جمع‌آوری منابع
- منطقه‌های هشدار و مرگ برای موانع

### پس‌زمینه‌ها

**سیستم responsive:**
```typescript
// پس‌زمینه ثابت با scaling مناسب برای تمام اندازه‌ها
const screenWidth = scene.scale.width;
const screenHeight = scene.scale.height;
const bgAspectRatio = bgImage.width / bgImage.height;
const screenAspectRatio = screenWidth / screenHeight;

if (screenAspectRatio > bgAspectRatio) {
  scaleX = screenWidth / bgImage.width;
  scaleY = scaleX;
} else {
  scaleY = screenHeight / bgImage.height;
  scaleX = scaleY;
}
```

## 🔊 سیستم صوتی

### انواع صداها

**موسیقی پس‌زمینه:**
- `ambient`: موسیقی آرام صحرا

**صداهای gameplay:**
- `collect_water`: جمع‌آوری آب
- `collect_gazelle`: جمع‌آوری غزاله
- `collect_rabbit`: جمع‌آوری خرگوش
- `hit_obstacle`: برخورد با مانع
- `car_horn`: بوق ماشین
- `dog_bark`: پارس سگ

**صداهای وضعیت:**
- `low_health`: هشدار سلامتی کم
- `victory`: پیروزی
- `game_over`: شکست

## 📊 آمار و تحلیل

### متریک‌های کلیدی

**عملکرد بازی:**
- نرخ تکمیل: تعداد بازی‌های تمام شده
- میانگین زمان: مدت زمان متوسط بازی
- نرخ زنده ماندن: درصد توله‌های زنده مانده

**مکانیک‌های بازی:**
- منابع جمع‌آوری شده: آمار هر نوع منبع
- برخورد با موانع: تعداد هر نوع مانع
- منطقه‌های هشدار: تعداد برخورد با شترها
- سلامتی: تغییرات سلامتی در طول بازی

### سیستم تحلیل

**رویدادهای ردیابی شده:**
```typescript
trackEvent('lane_change', {
  sessionId,
  newLane,
  month: currentMonth
});

trackEvent('resource_collected', {
  sessionId,
  resourceType,
  month: currentMonth
});

trackEvent('collision', {
  sessionId,
  type: 'health_reduced',
  obstacleType: 'camel',
  healthReduction: 30,
  month: currentMonth
});
```

## 🔧 تنظیمات پیشرفته

### متغیرهای قابل تنظیم

**سرعت بازی:**
```typescript
const GAME_SPEED = 200;        // پیکسل بر ثانیه
const LOW_HEALTH_SPEED = 100;  // سرعت در سلامتی کم
const LANE_COUNT = 4;          // تعداد مسیرها
```

**زمان‌بندی:**
```typescript
const MONTH_DURATION_MIN = 6;  // ثانیه (حداقل)
const MONTH_DURATION_MAX = 8;  // ثانیه (حداکثر)
const HEALTH_DECAY_BASE = 7;   // کاهش پایه سلامتی
const HEALTH_DECAY_MAX = 15;   // کاهش حداکثر سلامتی
```

**امتیازدهی:**
```typescript
const BASE_POINTS = 10;        // امتیاز پایه
const TIME_BONUS = 5;          // امتیاز هر ثانیه
const CUB_BONUS = 100;         // امتیاز هر توله
const PERFECT_BONUS = 500;     // جایزه کامل
```

## 🐛 حالت‌های خطا

### شرایط پایان بازی

**پایان موفق:**
- تکمیل ۱۸ ماه
- تمام توله‌ها زنده

**پایان ناموفق:**
- سلامتی مادر = ۰ (گرسنگی)
- تمام توله‌ها مردند
- برخورد با مانع مرگبار

### پیام‌های پایانی

**پیروزی:**
```json
{
  "achievementTitle": "قهرمان یوزها",
  "conservationMessage": "شما به نجات یوزپلنگ آسیایی کمک کردید!"
}
```

**شکست:**
```json
{
  "achievementTitle": "تلاش مجدد",
  "conservationMessage": "یوزپلنگ آسیایی نیاز به حمایت دارد"
}
```

## 🎯 نکات طراحی

### اصول طراحی

**سادگی:**
- کنترل یک‌انگشتی
- مکانیک‌های واضح
- یادگیری سریع

**جذابیت:**
- پیشرفت بصری با فصل‌ها
- انیمیشن‌های روان
- بازخورد فوری

**آموزندگی:**
- پیام‌های حفاظتی
- نمایش چالش‌های واقعی
- تشویق به اشتراک‌گذاری

---

**برای بهبود مکانیک‌های بازی با تیم توسعه تماس بگیرید**