import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const LearnMoreScreen = () => {
  const [currentSection, setCurrentSection] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Shared values for letters (ʻOkina Weather logo animation)
  const fadeAnimLetters = [
    useSharedValue(1), // ʻ
    useSharedValue(1), // O
    useSharedValue(1), // k
    useSharedValue(1), // i
    useSharedValue(1), // n
    useSharedValue(1), // a
    useSharedValue(1), // W
    useSharedValue(1), // e
    useSharedValue(1), // a
    useSharedValue(1), // t
    useSharedValue(1), // h
    useSharedValue(1), // e
    useSharedValue(1), // r
  ];

  const okinaTranslateX = useSharedValue(0);
  const okinaScale = useSharedValue(1);
  const raindropFadeAnim = useSharedValue(0);

  // Shared values for content animations
  const contentOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);
  const emojiRotate = useSharedValue(0);

  useEffect(() => {
    if (currentSection === -1) {
      // Delay the start of the initial animation by 2 seconds
      setTimeout(() => {
        startInitialAnimation();
      }, 1500);
    } else {
      startContentAnimation();
    }
  }, [currentSection]);

  const startInitialAnimation = () => {
    setIsAnimating(true);

    // Loop through the letters in reverse order to animate from right to left
    fadeAnimLetters
      .slice()
      .reverse()
      .forEach((anim, index) => {
        if (index === fadeAnimLetters.length - 1) return; // Skip the ʻokina
        anim.value = withDelay(index * 400, withTiming(0, { duration: 1000 }));
      });

    okinaTranslateX.value = withSequence(
      withDelay(
        fadeAnimLetters.length * 400,
        withTiming(screenWidth / 2 - 30, { duration: 1000 })
      ),
      withTiming(screenWidth / 2 - 50, { duration: 500 })
    );

    okinaScale.value = withDelay(
      (fadeAnimLetters.length - 1) * 400 + 1000,
      withTiming(1.5, { duration: 1000 })
    );

    raindropFadeAnim.value = withDelay(
      (fadeAnimLetters.length - 1) * 400 + 1000,
      withTiming(1, { duration: 1000 })
    );

    setIsAnimating(false);
  };

  const startContentAnimation = () => {
    setIsAnimating(true);

    contentOpacity.value = withTiming(1, { duration: 500 });
    emojiScale.value = withSpring(1, { mass: 0.5, stiffness: 120 });
    emojiRotate.value = withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    setIsAnimating(false);
  };

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      if (currentSection === -1) {
        raindropFadeAnim.value = withTiming(0, { duration: 300 });
        setCurrentSection((prev) => prev + 1);
      } else {
        contentOpacity.value = withTiming(0, { duration: 300 });
        emojiScale.value = withTiming(0, { duration: 300 });
        emojiRotate.value = withTiming(0, { duration: 300 });
        setCurrentSection((prev) =>
          prev < sections.length - 1 ? prev + 1 : 0
        );
      }
      setIsAnimating(false);
    }
  };

  const letterStyles = fadeAnimLetters.map((anim, index) =>
    useAnimatedStyle(() => ({
      opacity: anim.value,
      transform: [{ translateX: index === 0 ? 0 : anim.value * 10 }], // Exclude ʻokina from translation
    }))
  );

  const okinaStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: okinaTranslateX.value },
      { scale: okinaScale.value },
    ],
  }));

  const raindropStyle = useAnimatedStyle(() => ({
    opacity: raindropFadeAnim.value,
    transform: [
      { translateY: raindropFadeAnim.value * -40 },
      { scale: raindropFadeAnim.value },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: emojiScale.value },
      { rotate: `${emojiRotate.value}deg` },
    ],
  }));

  const renderLogoAnimation = () => (
    <View style={styles.logoAnimationContainer}>
      <View style={styles.logoContainer}>
        <Animated.Text style={[styles.logoText, okinaStyle]}>ʻ</Animated.Text>
        {["O", "k", "i", "n", "a", "W", "e", "a", "t", "h", "e", "r"].map(
          (letter, index) => (
            <Animated.Text
              key={index}
              style={[styles.logoText, letterStyles[index + 1]]}
            >
              {letter}
            </Animated.Text>
          )
        )}
      </View>
      <Animated.Text style={[styles.raindropText, raindropStyle]}>
        💧
      </Animated.Text>
    </View>
  );

  const renderContent = () => (
    <Animated.View style={[styles.content, contentStyle]}>
      <Text style={styles.title}>
        {sections[currentSection]?.title}{" "}
        <Animated.Text style={[styles.emoji, emojiStyle]}>
          {sections[currentSection]?.emojis}
        </Animated.Text>
      </Text>
      <Text style={styles.text}>{sections[currentSection]?.content}</Text>
      <TouchableOpacity style={styles.guideButton} onPress={handleNext}>
        <Text style={styles.guideText}>
          {sections[currentSection]?.guideText}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const sections = [
    {
      title: "ʻOkina Weather: Previously Da Kine Weather",
      content:
        "ʻOkina Weather, previously known as Da Kine Weather, is an app designed to provide accurate weather updates for towns. 🌦️ We transitioned to the name ʻOkina Weather to better reflect our commitment to cultural understanding and the unique character of the Hawaiian language. The ʻokina, which resembles a raindrop, is a symbol of our focus on local relevance and precision in weather forecasting. 🌧️",
      guideText: "Learn more about our journey!",
      emojis: "🌦️🌧️",
    },
    {
      title: "The Beginning of ʻOkina Weather",
      content:
        "ʻOkina Weather began as a project at Dev Island. 🎓 Our goal was to create something that could genuinely help local businesses and people by providing accurate weather information. 📱 Imagine having a simple, reliable way to check the weather, especially in places where it's tricky to predict. We started as Da Kine Weather, focusing on local relevance and community input.",
      guideText: "Learn about our mission!",
      emojis: "🌧️📱",
    },
    {
      title: "The Mystery of the ʻOkina",
      content:
        "Our app initially struggled to fetch weather data for Kapaʻa, a town with a special character in its name: the ʻokina. 🧐 Despite multiple attempts with AI, the issue remained unresolved. I was ready to spend weeks figuring it out. Then, a few days prior, a friend had explained that the ʻokina is not just an apostrophe; it's a unique character in the Hawaiian language. This suddenly clicked in my mind, and I realized the computer didn't recognize the ʻokina as a unique character. That insight solved the problem! This realization also inspired our rebranding to ʻOkina Weather, where the ʻokina symbolizes a raindrop, aligning perfectly with our focus. 👥",
      guideText: "Discover how a simple insight made a big difference!",
      emojis: "🧠👥",
    },
    {
      title: "Power of Community Input",
      content:
        "ʻOkina Weather isn't just about technology; it's about people. Our app thrives on community input. Users share their weather reports, 🗳️ making the app more accurate and useful. It's a collective effort where everyone's input helps create a better tool. 🌟",
      guideText: "See how community input shapes our app!",
      emojis: "🌟🗳️",
    },
    {
      title: "Inspiring Future Developers",
      content:
        "ʻOkina Weather is more than an app; it's a story of resilience and creativity. 🚀 We want to inspire future developers to see challenges as opportunities. 🌱 Remember, facing tough problems helps you grow, and your unique ideas can make a big impact. 💪",
      guideText: "Be inspired to innovate and create!",
      emojis: "🚀🌱",
    },
    {
      title: "Embracing the Age of AI",
      content:
        "As we step into the AI era, things are advancing faster than ever. 🌐 AI gives us the power to bring our ideas to life quickly, turning dreams into reality in months instead of years. 🌟 But while AI is a powerful tool that accelerates innovation, it's the human touch that makes the real difference. Your creativity and insights are irreplaceable. 🧠 And that's the story of how we solved a unique issue and how ʻOkina Weather got its name as a tribute to my peers stepping into the age of AI as software developers.",
      guideText: "Explore how AI can help you achieve your dreams!",
      emojis: "🤖💻",
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {currentSection === -1 ? (
        <View style={styles.logoSlide}>{renderLogoAnimation()}</View>
      ) : (
        <>
          <Animated.View style={[styles.textLogo, { opacity: 1 }]}>
            <Text style={styles.textLogoMain}>ʻOkina Weather</Text>
            <Text style={styles.textLogoSub}>Discover Our Journey</Text>
          </Animated.View>

          {renderContent()}
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoSlide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoAnimationContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: screenWidth,
    height: screenHeight,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  logoText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#4FC3F7",
    fontFamily: "Montserrat-Bold",
    marginHorizontal: 2,
  },
  raindropText: {
    fontSize: 100,
    color: "#4FC3F7",
    position: "absolute",
    left: screenWidth / 2 - 50, // Center the raindrop
  },
  textLogo: {
    alignItems: "center",
    marginBottom: 20,
  },
  textLogoMain: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4FC3F7",
    fontFamily: "Montserrat-Bold",
  },
  textLogoSub: {
    fontSize: 16,
    color: "#555",
    fontFamily: "Montserrat-Regular",
  },
  content: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Montserrat-Bold",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    fontFamily: "Montserrat-Regular",
    lineHeight: 24,
  },
  guideButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#E0F7FA",
    borderRadius: 10,
  },
  guideText: {
    fontSize: 16,
    color: "#00796B",
    textAlign: "center",
    fontFamily: "Montserrat-Medium",
  },
  button: {
    backgroundColor: "#4FC3F7",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    width: "80%",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Montserrat-Bold",
  },
});

export default LearnMoreScreen;
