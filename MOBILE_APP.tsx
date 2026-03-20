import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";

const { width, height } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = "splash" | "auth" | "onboarding";
type AuthMode = "login" | "signup";

// ─── Splash Screen ───────────────────────────────────────────────────────────
function SplashScreen({ onFinish }: { onFinish: () => void }) {
  // car horizontal position: starts off-screen left, moves to center
  const carX = useRef(new Animated.Value(-width / 2 - 60)).current;
  // speed-trail width: wide while moving, shrinks to 0 at center
  const trailWidth = useRef(new Animated.Value(160)).current;
  const trailOpacity = useRef(new Animated.Value(1)).current;
  // circular flip: 0 → 360 (first spin) then pause then 360 → 720 (second spin)
  const spinVal = useRef(new Animated.Value(0)).current;
  // circle scale: pops in when car arrives
  const circleScale = useRef(new Animated.Value(0)).current;
  // app name + tagline fade
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Car slides in from left with trail
      Animated.timing(carX, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      // 2. Trail shrinks + circle pops in simultaneously
      Animated.parallel([
        Animated.timing(trailWidth, { toValue: 0, duration: 250, useNativeDriver: false }),
        Animated.timing(trailOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.spring(circleScale, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      ]),
      // 3. First circular flip (360°)
      Animated.timing(spinVal, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // 4. Pause
      Animated.delay(400),
      // 5. Second circular flip (another 360°)
      Animated.timing(spinVal, {
        toValue: 2,
        duration: 600,
        useNativeDriver: true,
      }),
      // 6. App name fades up
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(textY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // 7. Hold then finish
      Animated.delay(1200),
    ]).start(onFinish);
  }, []);

  const spin2 = spinVal.interpolate({ inputRange: [0, 1, 2], outputRange: ["0deg", "360deg", "720deg"] });

  return (
    <View style={splash.container}>
      <StatusBar barStyle="light-content" />

      {/* Car + trail sliding in */}
      <Animated.View
        style={[
          splash.carWrapper,
          { transform: [{ translateX: carX }] },
        ]}
      >
        {/* Speed trail (pill shape behind car) */}
        <Animated.View
          style={[
            splash.trail,
            { width: trailWidth, opacity: trailOpacity },
          ]}
        />

        {/* Circle with car icon — spins in place */}
        <Animated.View
          style={[
            splash.circle,
            { transform: [{ scale: circleScale }, { rotate: spin2 }] },
          ]}
        >
          {/* Car SVG-style using text emoji */}
          <Text style={splash.carIcon}>🚗</Text>
        </Animated.View>
      </Animated.View>

      {/* App name below */}
      <Animated.View
        style={[
          splash.textBlock,
          { opacity: textOpacity, transform: [{ translateY: textY }] },
        ]}
      >
        <Text style={splash.tagline}>Your automotive knowledge companion</Text>
        <Text style={splash.appName}>SafeDrive Network</Text>
      </Animated.View>
    </View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4a3fd4",
    justifyContent: "center",
    alignItems: "center",
  },
  carWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  trail: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.85)",
    marginRight: -26, // overlaps behind circle
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  carIcon: { fontSize: 36 },
  textBlock: {
    position: "absolute",
    bottom: "30%",
    alignItems: "center",
  },
  tagline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

// ─── Auth Screen (Login / Sign Up) ───────────────────────────────────────────
function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (next: AuthMode) => {
    Animated.timing(slideAnim, { toValue: next === "login" ? 0 : 1, duration: 300, useNativeDriver: false }).start();
    setMode(next);
  };

  const handleSubmit = () => {
    if (!email || !password || (mode === "signup" && !name)) return;
    onSuccess();
  };

  const tabIndicatorLeft = slideAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "50%"] });

  return (
    <SafeAreaView style={auth.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={auth.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={auth.header}>
          <Text style={auth.headerTitle}>{mode === "login" ? "Welcome back" : "Create account"}</Text>
          <Text style={auth.headerSub}>{mode === "login" ? "Sign in to continue" : "Join us today"}</Text>
        </View>

        {/* Tab Toggle */}
        <View style={auth.tabBar}>
          <Animated.View style={[auth.tabIndicator, { left: tabIndicatorLeft }]} />
          <TouchableOpacity style={auth.tab} onPress={() => switchMode("login")} accessibilityRole="tab">
            <Text style={[auth.tabText, mode === "login" && auth.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={auth.tab} onPress={() => switchMode("signup")} accessibilityRole="tab">
            <Text style={[auth.tabText, mode === "signup" && auth.tabTextActive]}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={auth.form}>
          {mode === "signup" && (
            <View style={auth.inputGroup}>
              <Text style={auth.label}>Full Name</Text>
              <TextInput
                style={auth.input}
                placeholder="Your name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                accessibilityLabel="Full name input"
              />
            </View>
          )}

          <View style={auth.inputGroup}>
            <Text style={auth.label}>Email</Text>
            <TextInput
              style={auth.input}
              placeholder="you@example.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel="Email input"
            />
          </View>

          <View style={auth.inputGroup}>
            <Text style={auth.label}>Password</Text>
            <TextInput
              style={auth.input}
              placeholder="••••••••"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password input"
            />
          </View>

          {mode === "login" && (
            <TouchableOpacity style={auth.forgotBtn} accessibilityRole="button">
              <Text style={auth.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={auth.submitBtn} onPress={handleSubmit} accessibilityRole="button">
            <Text style={auth.submitText}>{mode === "login" ? "Sign In" : "Create Account"}</Text>
          </TouchableOpacity>

          <View style={auth.dividerRow}>
            <View style={auth.divider} />
            <Text style={auth.dividerText}>or continue with</Text>
            <View style={auth.divider} />
          </View>

          <View style={auth.socialRow}>
            {["G", "A", "F"].map((icon) => (
              <TouchableOpacity key={icon} style={auth.socialBtn} accessibilityRole="button" accessibilityLabel={`Sign in with ${icon}`}>
                <Text style={auth.socialIcon}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const auth = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32 },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 30, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 15, color: "#888", marginTop: 6 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1e1e30",
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    width: "50%",
    height: "100%",
    backgroundColor: "#e94560",
    borderRadius: 10,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "#fff" },
  form: { gap: 16 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, color: "#aaa", fontWeight: "500" },
  input: {
    backgroundColor: "#1e1e30",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#2a2a40",
  },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { color: "#e94560", fontSize: 13 },
  submitBtn: {
    backgroundColor: "#e94560",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#e94560",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 8 },
  divider: { flex: 1, height: 1, backgroundColor: "#2a2a40" },
  dividerText: { color: "#666", fontSize: 12 },
  socialRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#1e1e30",
    borderWidth: 1,
    borderColor: "#2a2a40",
    justifyContent: "center",
    alignItems: "center",
  },
  socialIcon: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

// ─── Onboarding Dashboard ─────────────────────────────────────────────────────
const ONBOARDING_STEPS = [
  {
    emoji: "🎯",
    title: "Set Your Goals",
    description: "Define what matters most to you and let us help you get there.",
    color: "#e94560",
  },
  {
    emoji: "📊",
    title: "Track Progress",
    description: "Visualize your growth with beautiful insights and analytics.",
    color: "#0f3460",
  },
  {
    emoji: "🚀",
    title: "Achieve More",
    description: "Stay motivated with smart reminders and milestone celebrations.",
    color: "#533483",
  },
];

function OnboardingDashboard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goTo = (next: number) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={[onboard.container, { backgroundColor: "#0f0f1a" }]}>
      <StatusBar barStyle="light-content" />

      {/* Skip */}
      <TouchableOpacity style={onboard.skipBtn} onPress={onComplete} accessibilityRole="button">
        <Text style={onboard.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Card */}
      <Animated.View style={[onboard.card, { opacity: fadeAnim, borderColor: current.color }]}>
        <View style={[onboard.emojiCircle, { backgroundColor: current.color + "22" }]}>
          <Text style={onboard.emoji}>{current.emoji}</Text>
        </View>
        <Text style={onboard.cardTitle}>{current.title}</Text>
        <Text style={onboard.cardDesc}>{current.description}</Text>
      </Animated.View>

      {/* Dots */}
      <View style={onboard.dots}>
        {ONBOARDING_STEPS.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)} accessibilityRole="button" accessibilityLabel={`Step ${i + 1}`}>
            <View style={[onboard.dot, i === step && { backgroundColor: current.color, width: 24 }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions */}
      <View style={onboard.actions}>
        {step > 0 && (
          <TouchableOpacity style={onboard.backBtn} onPress={() => goTo(step - 1)} accessibilityRole="button">
            <Text style={onboard.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[onboard.nextBtn, { backgroundColor: current.color, flex: step > 0 ? 1 : undefined }]}
          onPress={isLast ? onComplete : () => goTo(step + 1)}
          accessibilityRole="button"
        >
          <Text style={onboard.nextText}>{isLast ? "Get Started" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const onboard = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 16, paddingBottom: 32 },
  skipBtn: { alignSelf: "flex-end", padding: 8 },
  skipText: { color: "#888", fontSize: 14 },
  card: {
    flex: 1,
    marginVertical: 32,
    backgroundColor: "#1a1a2e",
    borderRadius: 24,
    borderWidth: 1,
    padding: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  emoji: { fontSize: 48 },
  cardTitle: { fontSize: 26, fontWeight: "800", color: "#fff", textAlign: "center", marginBottom: 14 },
  cardDesc: { fontSize: 15, color: "#aaa", textAlign: "center", lineHeight: 24 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 28 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#333" },
  actions: { flexDirection: "row", gap: 12 },
  backBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2a2a40",
    alignItems: "center",
  },
  backText: { color: "#aaa", fontSize: 15, fontWeight: "600" },
  nextBtn: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  if (screen === "splash") return <SplashScreen onFinish={() => setScreen("auth")} />;
  if (screen === "auth") return <AuthScreen onSuccess={() => setScreen("onboarding")} />;
  return <OnboardingDashboard onComplete={() => setScreen("auth")} />;
}
