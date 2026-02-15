import { useState, useEffect } from "react";
import { Bell, BellOff, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    getPushSubscription,
    isPushNotificationSupported,
    getNotificationPermissionStatus,
    sendTestPushNotification
} from "@/lib/pushNotifications";
import { toast } from "sonner";

export function NotificationSettings() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    const checkSubscriptionStatus = async () => {
        setIsSupported(isPushNotificationSupported());
        setPermissionStatus(getNotificationPermissionStatus());

        const subscription = await getPushSubscription();
        setIsSubscribed(!!subscription);
    };

    const handleEnableNotifications = async () => {
        setIsLoading(true);
        try {
            const subscription = await subscribeToPushNotifications();
            if (subscription) {
                setIsSubscribed(true);
                setPermissionStatus("granted");
                toast.success("Notifications enabled! You will receive alerts for new bookings.");
            } else {
                toast.error("Failed to enable notifications. Please try again.");
            }
        } catch (error) {
            console.error("Notification enable error:", error);
            toast.error("Failed to enable notifications");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisableNotifications = async () => {
        setIsLoading(true);
        try {
            const success = await unsubscribeFromPushNotifications();
            if (success) {
                setIsSubscribed(false);
                toast.success("Notifications disabled");
            } else {
                toast.error("Failed to disable notifications");
            }
        } catch (error) {
            console.error("Notification disable error:", error);
            toast.error("Failed to disable notifications");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestNotification = () => {
        if (Notification.permission === "granted") {
            new Notification("🚕 Test Notification", {
                body: "This is what a booking notification looks like!",
                icon: "/icon-admin-192.png",
                badge: "/icon-admin-192.png",
                tag: "test-notification"
            });
            toast.success("Test notification sent!");
        } else {
            toast.error("Please enable notifications first");
        }
    };

    if (!isSupported) {
        return (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/50">
                <BellOff className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Notifications not supported</p>
                    <p className="text-xs text-muted-foreground">Your browser does not support push notifications</p>
                </div>
            </div>
        );
    }

    if (permissionStatus === "denied") {
        return (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/50 bg-destructive/10">
                <X className="w-5 h-5 text-destructive" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Notifications blocked</p>
                    <p className="text-xs text-muted-foreground">
                        Enable notifications in your browser settings to receive booking alerts
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-secondary/50">
                {isSubscribed ? (
                    <div className="w-10 h-10 rounded-full border-2 border-gold bg-gold/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-gold" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-border bg-secondary flex items-center justify-center">
                        <BellOff className="w-5 h-5 text-muted-foreground" />
                    </div>
                )}

                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                        Push Notifications
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {isSubscribed
                            ? "You will receive alerts for new bookings"
                            : "Get notified when new bookings arrive"}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isSubscribed && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleTestNotification}
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Local Test
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                    setIsLoading(true);
                                    const { success, error } = await sendTestPushNotification();
                                    setIsLoading(false);
                                    if (success) {
                                        toast.success("Server test sent! Check for notification.");
                                    } else {
                                        toast.error(`Server test failed: ${error}`);
                                    }
                                }}
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                Server Test
                            </Button>
                        </>
                    )}

                    <Button
                        variant={isSubscribed ? "outline" : "default"}
                        size="sm"
                        onClick={isSubscribed ? handleDisableNotifications : handleEnableNotifications}
                        disabled={isLoading}
                        className={isSubscribed ? "" : "gold-gradient"}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isSubscribed ? (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                Enabled
                            </>
                        ) : (
                            <>
                                <Bell className="w-4 h-4 mr-1" />
                                Enable
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
