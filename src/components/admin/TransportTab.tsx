import React from 'react';
import { 
  Bus, 
  Phone, 
  MessageSquare, 
  Navigation, 
  Play, 
  CheckCircle2 
} from 'lucide-react';
import { TransportRoute, Language } from '../../types';
import { useTranslation } from '../../translations';
import { generateBusAlertMessage } from '../../utils/whatsapp';

interface TransportTabProps {
  routes: TransportRoute[];
  lang: Language;
  onUpdateRoute: (route: TransportRoute) => void;
  onOpenWhatsApp: (recipientName: string, phone: string, defaultMsg: string) => void;
}

export const TransportTab: React.FC<TransportTabProps> = ({
  routes,
  lang,
  onUpdateRoute,
  onOpenWhatsApp
}) => {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const handleSimulateNextStop = (route: TransportRoute) => {
    const nextIndex = route.currentStopIndex + 1;
    if (nextIndex < route.stops.length) {
      const updatedStops = route.stops.map((s, idx) => ({
        ...s,
        passed: idx <= nextIndex
      }));
      onUpdateRoute({
        ...route,
        currentStopIndex: nextIndex,
        status: nextIndex === route.stops.length - 1 ? 'arrived' : 'on_route',
        stops: updatedStops
      });
    } else {
      // Reset route for demo convenience
      const resetStops = route.stops.map((s, idx) => ({
        ...s,
        passed: idx === 0
      }));
      onUpdateRoute({
        ...route,
        currentStopIndex: 0,
        status: 'on_route',
        stops: resetStops
      });
    }
  };

  const handleSendBusAlert = (route: TransportRoute) => {
    const currentStop = route.stops[route.currentStopIndex] || route.stops[0];
    const message = generateBusAlertMessage(route, currentStop.name, currentStop.nameAr, lang);
    const recipientLabel = isRtl ? `أولياء خط ${route.nameAr}` : `Parents d'élèves ${route.name}`;
    onOpenWhatsApp(recipientLabel, route.driverPhone, message);
  };

  const handleContactDriver = (route: TransportRoute) => {
    const msg = isRtl
      ? `مرحبا بالسيد ${route.driverNameAr}، تواصل من الإدارة بخصوص مسار الحافلة (${route.busPlate}).`
      : `Bonjour ${route.driverName}, communication de l'administration concernant le circuit bus (${route.busPlate}).`;
    onOpenWhatsApp(isRtl ? route.driverNameAr : route.driverName, route.driverPhone, msg);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{t.schoolTransport}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl ? 'متابعة جغرافية مباشرة لحافلات النقل المدرسي وإشعارات وصول للأولياء عبر واتساب' : 'Suivi géolocalisé en temps réel des bus scolaires avec alertes WhatsApp d\'arrivée'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isRtl ? 'الأسطول في الخدمة' : 'Flotte en service'}
          </span>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {routes.map(route => {
          const routeName = isRtl ? route.nameAr : route.name;
          const driverName = isRtl ? route.driverNameAr : route.driverName;

          return (
            <div 
              key={route.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5"
            >
              {/* Route Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 font-mono font-bold text-xs">
                      {route.code}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      {route.busPlate}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{routeName}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    route.status === 'on_route' ? 'bg-amber-100 text-amber-800' :
                    route.status === 'arrived' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {t.busStatus[route.status]}
                  </span>
                </div>
              </div>

              {/* Driver & Staff Bar */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t.driver}</div>
                  <div className="font-bold text-slate-800">{driverName}</div>
                  <div className="text-[11px] text-slate-500 font-mono" dir="ltr">{route.driverPhone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id={`whatsapp-driver-${route.id}-btn`}
                    onClick={() => handleContactDriver(route)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-2xs cursor-pointer"
                    title={isRtl ? 'مراسلة السائق' : 'Contacter le chauffeur'}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <a
                    href={`tel:${route.driverPhone}`}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
                    title={t.callPhone}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                  {t.stopsList}
                </div>
                <div className="space-y-2 relative before:absolute before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 before:start-3">
                  {route.stops.map((stop, idx) => {
                    const isCurrent = idx === route.currentStopIndex;
                    const stopName = isRtl ? stop.nameAr : stop.name;

                    return (
                      <div 
                        key={stop.id} 
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all relative z-10 ${
                          isCurrent 
                            ? 'bg-indigo-50/80 border border-indigo-200 font-bold text-indigo-950'
                            : stop.passed 
                            ? 'bg-slate-50 text-slate-500' 
                            : 'bg-white border border-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isCurrent 
                              ? 'bg-indigo-600 text-white shadow-xs animate-bounce' 
                              : stop.passed 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stop.passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <div>
                            <div>{stopName}</div>
                            {isCurrent && (
                              <span className="text-[10px] text-indigo-700 font-semibold">
                                {isRtl ? '📍 المحطة الحالية' : '📍 Position actuelle'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="font-mono text-[11px] text-slate-500" dir="ltr">
                          {stop.scheduledTime}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Operational Action Controls */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  id={`simulate-next-stop-${route.id}-btn`}
                  onClick={() => handleSimulateNextStop(route)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{t.simulateNextStop}</span>
                </button>

                <button
                  id={`alert-bus-parents-${route.id}-btn`}
                  onClick={() => handleSendBusAlert(route)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t.sendBusAlertWhatsApp}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
