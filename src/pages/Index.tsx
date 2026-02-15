import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Car, User, Phone, ChevronRight, Check, CalendarIcon, LocateFixed, Loader2, MessageCircle, Mail, Hotel, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { fetchRoutes, getLocationsFromRoutes, calculatePriceFromRoutes, hasRoundTripFromRoutes, type RouteRow, type Vehicle, type TripType } from "@/lib/pricing";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield, Clock3, Sparkles, PhoneCall } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import heroBg from "@/assets/hero-bg.jpg";
import vitoImg from "@/assets/vito.jpg";
import lodgyImg from "@/assets/lodgy.jpg";
import casablancaBg from "@/assets/casablanca-bg.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [serviceType, setServiceType] = useState<'transfer' | 'hourly'>('transfer');
  const [pickup, setPickup] = useState<string | null>(null);
  const [dropoff, setDropoff] = useState<string | null>(null);
  const [tripType, setTripType] = useState<TripType>('one_way');
  const [vehicle, setVehicle] = useState<Vehicle>('Vito');
  const [hours, setHours] = useState<number>(2);
  const [hourlyLocation, setHourlyLocation] = useState('');
  const [hourlyLocationLink, setHourlyLocationLink] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [pickupDate, setPickupDate] = useState<Date>(new Date());
  const [pickupHour, setPickupHour] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [roomOrPassengers, setRoomOrPassengers] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchRoutes().then(setRoutes);
  }, []);

  const locations = useMemo(() => getLocationsFromRoutes(routes), [routes]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const isToday = pickupDate.toDateString() === new Date().toDateString();
  const currentHour = new Date().getHours();

  const availableHours = useMemo(() => {
    const hrs: string[] = [];
    const startHour = isToday ? currentHour + 1 : 0;
    for (let h = startHour; h < 24; h++) {
      hrs.push(`${h.toString().padStart(2, '0')}:00`);
      hrs.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return hrs;
  }, [isToday, currentHour]);

  const effectiveTripType: TripType = serviceType === 'hourly' ? 'hourly' : tripType;
  const price = calculatePriceFromRoutes(
    routes,
    serviceType === 'hourly' ? 'Casablanca' : pickup,
    serviceType === 'hourly' ? null : dropoff,
    serviceType === 'hourly' ? 'Vito' : vehicle,
    effectiveTripType,
    hours
  );
  const showRoundTrip = serviceType === 'transfer' && hasRoundTripFromRoutes(routes, pickup, dropoff);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error(t("errGeoNotSupported"));
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const link = `https://maps.google.com/?q=${latitude},${longitude}`;
        const isInCasablanca = latitude >= 33.5 && latitude <= 33.7;
        const label = isInCasablanca
          ? "📍 Current GPS Location (Casablanca)"
          : "📍 Current GPS Location";
        if (!isInCasablanca) {
          toast.info(t("infoOutsideCasa"));
        }
        setHourlyLocation(label);
        setHourlyLocationLink(link);
        setErrors((prev) => ({ ...prev, hourlyLocation: undefined }));
        setGeoLoading(false);
      },
      () => {
        toast.error(t("errGeoFailed"));
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (serviceType === 'transfer' && !pickup) newErrors.pickup = t("errPickup");
    if (serviceType === 'transfer' && !dropoff) newErrors.dropoff = t("errDropoff");
    if (serviceType === 'hourly' && !hourlyLocation.trim()) newErrors.hourlyLocation = t("errLocation");
    if (!pickupHour) newErrors.pickupHour = t("errTime");
    if (!name.trim()) newErrors.name = t("errName");
    if (phone.length < 8) newErrors.phone = t("errPhone");
    if (!roomOrPassengers.trim()) newErrors.roomOrPassengers = t("errRoomOrPassengers");
    if (price === null) newErrors.price = t("errPrice");

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(t("errFillAll"));
      return;
    }

    const pickupTimeStr = `${format(pickupDate, 'dd/MM/yyyy')} ${pickupHour}`;

    setSubmitting(true);
    const { data, error } = await supabase.from("bookings").insert({
      passenger_name: name.trim(),
      phone: phone.trim(),
      pickup: serviceType === 'hourly' ? (hourlyLocationLink || hourlyLocation.trim()) : pickup!,
      dropoff: serviceType === 'hourly' ? null : dropoff!,
      vehicle: serviceType === 'hourly' ? 'Vito' : vehicle,
      trip_type: effectiveTripType,
      hours: serviceType === 'hourly' ? hours : null,
      pickup_time: pickupTimeStr,
      price,
      status: 'Pending',
      email: email.trim() || null,
      room_or_passengers: roomOrPassengers.trim() || null,
      comment: comment.trim() || null,
    } as any).select().maybeSingle();

    setSubmitting(false);
    if (error) {
      toast.error(t("errBookingFailed"));
      return;
    }
    navigate("/confirmation", { state: { booking: data } });
  };

  return (
    <main className="min-h-screen bg-background pt-10">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Luxury Mercedes transfer in Morocco" loading="eager" fetchpriority="high" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-3">
            {t("heroTitle1")} <span className="text-gold">{t("heroTitle2")}</span> {t("heroTitle3")}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </motion.div>
      </section>

      {/* Booking Widget */}
      <section className="relative z-20 -mt-16 px-4 pb-20 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass rounded-2xl p-6 md:p-8 gold-glow"
        >
          {/* Step 1: Service Type */}
          <div className="mb-6">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-3 block">{t("serviceType")}</Label>
            <div className="grid grid-cols-2 gap-3">
              {(['transfer', 'hourly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setServiceType(type);
                    if (type === 'hourly') { setVehicle('Vito'); setTripType('one_way'); }
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-sm font-medium ${serviceType === type
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground'
                    }`}
                >
                  {type === 'transfer' ? <MapPin className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  {type === 'transfer' ? t("transfer") : t("hourlyService")}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Route */}
          <div className="mb-6">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-3 block">
              {serviceType === 'hourly' ? t("duration") : t("route")}
            </Label>
            {serviceType === 'transfer' ? (
              <div className="space-y-3">
                <div>
                  <Select value={pickup ?? ''} onValueChange={(v) => { setPickup(v); setErrors((prev) => ({ ...prev, pickup: undefined })); }}>
                    <SelectTrigger className={cn("bg-secondary/50 border-border", errors.pickup && "border-destructive")}><SelectValue placeholder={t("pickupLocation")} /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {locations.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.pickup && <p className="text-destructive text-xs mt-1">{errors.pickup}</p>}
                </div>
                <div>
                  <Select value={dropoff ?? ''} onValueChange={(v) => { setDropoff(v); setErrors((prev) => ({ ...prev, dropoff: undefined })); }}>
                    <SelectTrigger className={cn("bg-secondary/50 border-border", errors.dropoff && "border-destructive")}><SelectValue placeholder={t("dropoffLocation")} /></SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {locations.filter((l) => l !== pickup).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.dropoff && <p className="text-destructive text-xs mt-1">{errors.dropoff}</p>}
                </div>
                {showRoundTrip && (
                  <div className="grid grid-cols-2 gap-3">
                    {(['one_way', 'round_trip'] as const).map((tt) => (
                      <button
                        key={tt}
                        onClick={() => setTripType(tt)}
                        className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${tripType === tt
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground'
                          }`}
                      >
                        {tt === 'one_way' ? t("oneWay") : t("roundTrip")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("yourLocation")}
                    value={hourlyLocation}
                    onChange={(e) => { setHourlyLocation(e.target.value); setHourlyLocationLink(null); }}
                    className="bg-secondary/50 border-border pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={handleLocateMe}
                    disabled={geoLoading}
                    title="Use my current location"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                  >
                    {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="bg-secondary/50 border-border w-24"
                  />
                  <span className="text-muted-foreground text-sm">{t("hoursLabel")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Vehicle (transfer only) */}
          {serviceType === 'transfer' && (
            <div className="mb-6">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-3 block">{t("vehicle")}</Label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'Vito' as Vehicle, label: t("businessClass"), sub: t("mercedesVito"), img: vitoImg },
                  { id: 'Dacia' as Vehicle, label: t("economy"), sub: t("daciaLodgy"), img: lodgyImg },
                ]).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVehicle(v.id)}
                    className={`rounded-xl border overflow-hidden transition-all ${vehicle === v.id
                      ? 'border-gold gold-glow'
                      : 'border-border hover:border-muted-foreground'
                      }`}
                  >
                    <img src={v.img} alt={v.sub} className="w-full h-28 object-cover" />
                    <div className="p-3 bg-secondary/50">
                      <p className={`text-sm font-semibold ${vehicle === v.id ? 'text-gold' : 'text-foreground'}`}>{v.label}</p>
                      <p className="text-xs text-muted-foreground">{v.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Price */}
          <AnimatePresence mode="wait">
            {price !== null && (
              <motion.div
                key={price}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-6 text-center py-4 rounded-xl bg-gold/5 border border-gold/20"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("totalPrice")}</p>
                <p className="text-4xl font-serif font-bold text-gold">{price.toLocaleString()} DH</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 5: Pickup Date & Time */}
          <div className="mb-6">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-3 block">{t("pickupDateTime")}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-secondary/50 border-border",
                      !pickupDate && "text-muted-foreground",
                      errors.pickupDate && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {format(pickupDate, "dd/MM/yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={pickupDate}
                    onSelect={(d) => {
                      if (d) {
                        setPickupDate(d);
                        setPickupHour('');
                        setErrors((prev) => ({ ...prev, pickupDate: undefined, pickupHour: undefined }));
                      }
                    }}
                    disabled={(date) => date < today}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={pickupHour}
                onValueChange={(v) => {
                  setPickupHour(v);
                  setErrors((prev) => ({ ...prev, pickupHour: undefined }));
                }}
              >
                <SelectTrigger className={cn("bg-secondary/50 border-border", errors.pickupHour && "border-destructive")}>
                  <SelectValue placeholder={t("selectTime")} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  {availableHours.length > 0 ? (
                    availableHours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">{t("noTimesAvailable")}</div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {errors.pickupHour && <p className="text-destructive text-xs mt-1">{errors.pickupHour}</p>}
          </div>

          {/* Step 6: Passenger Info */}
          <div className="mb-6 space-y-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider block">{t("passengerInfo")}</Label>
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("fullName")}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
                  className={cn("bg-secondary/50 border-border pl-10", errors.name && "border-destructive")}
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("whatsappNumber")}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: undefined })); }}
                  className={cn("bg-secondary/50 border-border pl-10", errors.phone && "border-destructive")}
                />
              </div>
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <div className="relative">
                <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("roomOrPassengers")}
                  value={roomOrPassengers}
                  onChange={(e) => { setRoomOrPassengers(e.target.value); setErrors((prev) => ({ ...prev, roomOrPassengers: undefined })); }}
                  className={cn("bg-secondary/50 border-border pl-10", errors.roomOrPassengers && "border-destructive")}
                />
              </div>
              {errors.roomOrPassengers && <p className="text-destructive text-xs mt-1">{errors.roomOrPassengers}</p>}
            </div>
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("emailOptional")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/50 border-border pl-10"
                />
              </div>
              <div className="mt-3">
                <div className="relative">
                  <Textarea
                    placeholder={t("commentPlaceholder")}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="bg-secondary/50 border-border min-h-[100px]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Step 7: Payment Method (mock) */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-sm font-medium border-gold bg-gold/10 text-gold">
              <Banknote className="w-4 h-4" />
              <span>{t("paymentMethod")} : <strong>{t("cashOnArrival")}</strong></span>
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full gold-gradient text-primary-foreground font-semibold text-base py-6 rounded-xl hover:opacity-90 transition-opacity"
          >
            {submitting ? t("booking") : t("bookNow")}
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="relative py-20 overflow-hidden">
        <img src={casablancaBg} alt="Casablanca cityscape background" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif font-bold text-center text-foreground mb-12"
          >
            {t("whyChoose1")} <span className="text-gold">{t("whyChoose2")}</span>?
          </motion.h2>
          <div className="grid grid-cols-2 gap-6 md:gap-10">
            {[
              { icon: Shield, title: t("noHiddenCharges"), desc: t("noHiddenChargesDesc") },
              { icon: Clock3, title: t("onTimePickup"), desc: t("onTimePickupDesc") },
              { icon: Sparkles, title: t("cleanVehicles"), desc: t("cleanVehiclesDesc") },
              { icon: PhoneCall, title: t("hoursReady"), desc: t("hoursReadyDesc") },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-full border-2 border-gold/50 flex items-center justify-center bg-background/40 backdrop-blur-md">
                  <item.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-foreground font-serif font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
