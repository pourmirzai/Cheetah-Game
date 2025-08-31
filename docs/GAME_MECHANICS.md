# 🎯 Game Mechanics Documentation

مستندات مکانیک‌های بازی نجات یوز ایران

## 📋 نمای کلی

بازی نجات یوز ایران یک vertical scroller است که از مکانیک‌های ساده اما جذاب استفاده می‌کند تا پیام حفاظت از یوزپلنگ آسیایی را منتقل کند.

## 🐾 شخصیت‌ها و موجودیت‌ها

### مادر یوزپلنگ (Player Character)

**ویژگی‌ها:**
- **حرکت**: کنترل با لمس/کلیک چپ و راست
- **سرعت پایه**: ۲۰۰ پیکسل بر ثانیه
- **جهش سرعت**: ۲ برابر سرعت پایه (۴۰۰ پیکسل بر ثانیه)
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

#### ۱. سگ‌ها (Dogs)
```typescript
const obstacleInfo = {
  type: 'dog',
  texture: 'dog-obstacle-pixel',
  healthDamage: 25,
  speedMultiplier: 1.0
};
```

#### ۲. تله‌ها (Traps)
```typescript
const obstacleInfo = {
  type: 'trap',
  texture: 'trap',
  healthDamage: 30,
  speedMultiplier: 0.8
};
```

#### ۳. شکارچیان (Poachers)
```typescript
const obstacleInfo = {
  type: 'poacher',
  texture: 'poacher',
  healthDamage: 50,
  speedMultiplier: 1.2
};
```

#### ۴. جاده‌ها (Roads)
- **ویژگی خاص**: امتداد تمام مسیرها
- **ماشین‌ها**: حرکت افقی تصادفی
- **خطر بالا**: برخورد با ماشین = پایان بازی

### مکانیک برخورد

**برخورد با مادر:**
```typescript
scene.physics.add.overlap(scene.motherCheetah, obstacle, () => {
  scene.audioManager?.onHitObstacle(obstacleInfo.type);
  endGame(scene, obstacleInfo.type);
});
```

**برخورد با توله:**
```typescript
scene.cubs.forEach((cub, index) => {
  scene.physics.add.overlap(cub, obstacle, () => {
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

#### ۳. خرگوش (Rabbit) - ویژه
```typescript
const resourceInfo = {
  type: 'rabbit',
  texture: 'rabbit-resource-pixel',
  healthGain: 10,
  points: 100,
  specialEffect: 'speed_burst_charge'
};
```

### مکانیک جمع‌آوری

**جمع‌آوری عادی:**
```typescript
scene.physics.add.overlap(scene.motherCheetah, resource, () => {
  collectResource(scene, resourceInfo.type);
  resource.destroy();
});
```

**خرگوش ویژه:**
```typescript
if (type === 'rabbit') {
  scene.gameData.rabbitsCollected += 1;

  if (scene.gameData.rabbitsCollected >= 3) {
    scene.gameData.burstEnergy = 100;
    scene.gameData.rabbitsCollected = 0;
  }
}
```

## ⚡ سیستم جهش سرعت (Speed Burst)

### مکانیک کارکرد

**شرط فعال‌سازی:**
- ۳ خرگوش جمع‌آوری شده
- انرژی جهش = ۱۰۰%

**ویژگی‌ها:**
- **مدت زمان**: ۲ ثانیه
- **ضریب سرعت**: ۲ برابر
- **هزینه**: تمام انرژی جهش
- **cooldown**: شارژ مجدد در طول زمان

**فعال‌سازی:**
```typescript
function triggerSpeedBurst(scene: GameScene) {
  if (scene.gameData.burstEnergy >= 100) {
    scene.gameData.speedBurstActive = true;
    scene.gameSpeed *= 2;

    // پایان جهش بعد از ۲ ثانیه
    scene.time.delayedCall(2000, () => {
      scene.gameData.speedBurstActive = false;
      scene.gameSpeed /= 2;
    });
  }
}
```

## ⏰ سیستم زمان و پیشرفت

### چرخه زمانی

**کل مدت بازی:** ۱۲۰ ثانیه = ۱۸ ماه

**تقسیم زمانی:**
- **هر ماه**: ۶-۸ ثانیه واقعی
- **هر فصل**: ۳ ماه
- **تغییر فصل**: خودکار با ماه جدید

### پیشرفت بازی

**شاخص‌های پیشرفت:**
- **ماه فعلی**: ۱ تا ۱۸
- **فصل فعلی**: بر اساس ماه
- **زمان باقی‌مانده**: شمارش معکوس
- **سلامتی خانواده**: نوار سلامتی
- **امتیاز کل**: مجموع امتیازات

## 🏆 سیستم امتیازدهی

### منابع امتیاز

**امتیاز پایه:**
- آب: ۱۰ امتیاز × ضریب سلامتی
- غزاله: ۱۰ امتیاز × ضریب سلامتی
- خرگوش: ۱۰ امتیاز × ضریب سلامتی

**امتیاز زمان:**
- تکمیل سریع‌تر = امتیاز بیشتر
- هر ثانیه باقی‌مانده = ۵ امتیاز اضافی

**امتیاز زنده ماندن:**
- هر توله زنده = ۱۰۰ امتیاز
- تمام توله‌ها زنده = جایزه ۵۰۰ امتیاز

### محاسبه نهایی

```typescript
const finalScore =
  baseScore +
  (timeRemaining * 5) +
  (cubsSurvived * 100) +
  (cubsSurvived === 4 ? 500 : 0);
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
- هشدارهای سلامتی
- انیمیشن جمع‌آوری منابع
- افکت‌های particle برای جهش سرعت

### پس‌زمینه‌ها

**Parallax Effect:**
```typescript
// حرکت لایه‌های مختلف با سرعت متفاوت
scene.background.tilePositionY -= scene.gameSpeed / 60;
scene.farBackground.tilePositionY -= (scene.gameSpeed / 60) * 0.3;
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
- `speed_burst`: فعال‌سازی جهش سرعت

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
- استفاده از جهش سرعت: تعداد دفعات استفاده
- منابع جمع‌آوری شده: آمار هر نوع منبع
- برخورد با موانع: تعداد هر نوع مانع

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

trackEvent('speed_burst_used', {
  sessionId,
  duration: 2000,
  month: currentMonth
});
```

## 🔧 تنظیمات پیشرفته

### متغیرهای قابل تنظیم

**سرعت بازی:**
```typescript
const GAME_SPEED = 200;        // پیکسل بر ثانیه
const BURST_MULTIPLIER = 2;   // ضریب جهش سرعت
const LANE_COUNT = 4;          // تعداد مسیرها
```

**زمان‌بندی:**
```typescript
const GAME_DURATION = 120;     // ثانیه
const MONTH_DURATION = 7;      // ثانیه (میانگین)
const HEALTH_DECAY = 5;        // کاهش سلامتی بر ثانیه
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