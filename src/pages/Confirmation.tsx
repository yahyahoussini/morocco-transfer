import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const booking = location.state?.booking;
  const [whatsappNumber, setWhatsappNumber] = useState("212600000000");

  useEffect(() => {
    supabase.from("settings").select("value").eq("key", "whatsapp_number").maybeSingle().then(({ data }) => {
      if (data) setWhatsappNumber((data as any).value);
    });
  }, []);

  if (!booking) {
    navigate("/");
    return null;
  }

  const whatsappMessage = encodeURIComponent(
    `Hello Morocco Transfers!\n\nBooking Ref: ${booking.id.slice(0, 8).toUpperCase()}\nName: ${booking.passenger_name}\nRoute: ${booking.pickup}${booking.dropoff ? ` → ${booking.dropoff}` : ''}\nVehicle: ${booking.vehicle === 'Vito' ? 'Mercedes vito de luxe' : 'Dacia Lodgy'}\nPrice: ${booking.price} DH\n\nI'd like to confirm my booking.`
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-8 max-w-md w-full text-center gold-glow"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 gold-gradient rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{t("bookingConfirmed")}</h1>
        <p className="text-muted-foreground mb-6">{t("transferReserved")}</p>

        <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t("reference")}</span>
            <span className="text-gold font-mono font-semibold">{booking.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t("route")}</span>
            <span className="text-foreground text-sm">{booking.pickup}{booking.dropoff ? ` → ${booking.dropoff}` : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">{t("vehicle")}</span>
            <span className="text-foreground text-sm">{booking.vehicle === 'Vito' ? t("mercedesVito") : t("daciaLodgy")}</span>
          </div>
          {booking.room_or_passengers && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("roomOrPassengers")}</span>
              <span className="text-foreground text-sm">{booking.room_or_passengers}</span>
            </div>
          )}
          {booking.pickup_time && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("pickupTime")}</span>
              <span className="text-foreground text-sm">{booking.pickup_time}</span>
            </div>
          )}
          {booking.trip_type === 'hourly' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("duration")}</span>
              <span className="text-foreground text-sm">{booking.hours} hours</span>
            </div>
          )}
          {booking.comment && (
            <div className="flex flex-col gap-1 mt-2 mb-2 p-2 bg-background/50 rounded-lg">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">{t("commentLabel")}</span>
              <p className="text-foreground text-sm italic">"{booking.comment}"</p>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <span className="text-muted-foreground text-sm">{t("total")}</span>
            <span className="text-gold font-serif font-bold text-lg">{Number(booking.price).toLocaleString()} DH</span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-secondary/50 rounded-xl p-4 mb-6">
          <span className="text-muted-foreground text-sm">{t("paymentMethod")}</span>
          <span className="text-gold font-semibold text-sm">{t("cashOnArrival")}</span>
        </div>

        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 gold-gradient text-primary-foreground font-semibold py-3 rounded-xl mb-3 hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-5 h-5" />
          {t("contactWhatsApp")}
        </a>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("makeAnother")}
        </Button>
      </motion.div>
    </div>
  );
};

export default Confirmation;
