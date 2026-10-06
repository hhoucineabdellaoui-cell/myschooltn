import React from 'react';
import { 
  Utensils, 
  MessageSquare, 
  Flame, 
  Users 
} from 'lucide-react';
import { CanteenDay, Student, Language } from '../../types';
import { useTranslation } from '../../translations';

interface CanteenTabProps {
  menu: CanteenDay[];
  students: Student[];
  lang: Language;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string) => void;
}

export const CanteenTab: React.FC<CanteenTabProps> = ({
  menu,
  students,
  lang,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';
  const canteenStudents = students.filter(s => s.canteenSubscribed);

  const handleBroadcastMenuWhatsApp = () => {
    let msg = '';
    if (isRtl) {
      msg = `🍽️ *قائمة أكلات الأسبوع - المطعم المدرسي بتونس*\nأولياء الأمور الكرام، إليكم البرنامج الغذائي المتوازن لهذا الأسبوع :\n-----------------------------------\n${menu.map(m => `📅 *${m.dayAr}*:\n🥗 المقبلات: ${m.starterAr}\n🍲 الطبق الرئيسي: ${m.mainDishAr}\n🍊 التحلية: ${m.dessertAr} (${m.calories} سعرة حرارية)`).join('\n\n')}\n-----------------------------------\nشهية طيبة لجميع أبنائنا التلاميذ!`;
    } else {
      msg = `🍽️ *Menu de la semaine - Cantine Scolaire Tunisie*\nChers Parents, voici les menus équilibrés préparés avec soin pour nos élèves :\n-----------------------------------\n${menu.map(m => `📅 *${m.day}* :\n🥗 Entrée : ${m.starter}\n🍲 Plat : ${m.mainDish}\n🍊 Dessert : ${m.dessert} (${m.calories} kcal)`).join('\n\n')}\n-----------------------------------\nBon appétit à tous nos élèves !`;
    }

    onOpenWhatsApp(isRtl ? 'أولياء التلاميذ المشتركين في المطعم' : 'Parents d\'élèves inscrits à la cantine', '+21698123456', msg);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Broadcast */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{t.canteenMenu}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl ? 'وجبات صحية ومتوازنة مطبوخة يومياً على عين المكان' : 'Repas équilibrés cuisinés sur place chaque jour'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/60 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{canteenStudents.length} {t.canteenSubscribers}</span>
          </div>
          <button
            id="broadcast-canteen-menu-btn"
            onClick={handleBroadcastMenuWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.sendMenuWhatsApp}</span>
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menu.map((item, idx) => {
          const dayName = isRtl ? item.dayAr : item.day;
          const starterName = isRtl ? item.starterAr : item.starter;
          const mainName = isRtl ? item.mainDishAr : item.mainDish;
          const dessertName = isRtl ? item.dessertAr : item.dessert;

          return (
            <div 
              key={idx} 
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <h4 className="font-black text-sm text-slate-900">{dayName}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{item.date}</span>
                </div>

                {/* Courses */}
                <div className="space-y-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.starter}</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{starterName}</div>
                  </div>
                  <div className="bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/50">
                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{t.mainDish}</div>
                    <div className="font-bold text-slate-900 mt-0.5">{mainName}</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.dessert}</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{dessertName}</div>
                  </div>
                </div>
              </div>

              {/* Bottom details: Calories and Allergens */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 font-bold text-amber-700">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{item.calories} kcal</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.allergens.map((alg, aIdx) => (
                    <span key={aIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                      {alg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
