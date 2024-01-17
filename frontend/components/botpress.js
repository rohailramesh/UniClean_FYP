import { Button, View, ImageBackground, StyleSheet } from "react-native";
import BpWidget from "../utils/BpWidget";
import BpIncommingMessagesListener from "../utils/BpIncommingMessagesListener";
import { useRef } from "react";

const testingConfig = {
  showPoweredBy: false,
  showCloseButton: false,
  botName: "UniChat Bot",
  botConversationDescription: "Got a question? Ask UniChat",
  composerPlaceholder: "Ask me anything...",
  botId: "863c0810-aa3f-4783-ac29-b1348503eb0f",
  hostUrl: "https://cdn.botpress.cloud/webchat/v1",
  messagingUrl: "https://messaging.botpress.cloud",
  clientId: "863c0810-aa3f-4783-ac29-b1348503eb0f",
  webhookId: "10374dbe-221b-48ed-a4b4-7845b593ea18",
  lazySocket: true,
  themeName: "prism",
  frontendVersion: "v1",
  useSessionStorage: true,
  enableConversationDeletion: true,
  showPoweredBy: false,
  theme: "prism",
  themeColor: "#2563eb",
};

export default function Botpress() {
  const botpressWebChatRef = useRef();

  const sendExampleEvent = () => {
    botpressWebChatRef.current?.sendEvent({ type: "toggle" });
  };
  const sendExamplePayload = () => {
    botpressWebChatRef.current?.sendPayload({ type: "text", text: "hello" });
  };
  const changeExampleConfig = () => {
    botpressWebChatRef.current?.mergeConfig({ botName: Math.random() });
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: 60,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* <Text>Your app header or spacer</Text> */}
        </View>
        <BpWidget
          ref={botpressWebChatRef}
          botConfig={testingConfig}
          onMessage={(event) => {
            console.log("event from widget", event);
          }}
        />
        {/* <Button onPress={sendExampleEvent} title="Toggle webchat" />
        <Button onPress={changeExampleConfig} title="changeConfig" />
        <Button onPress={sendExamplePayload} title="send message" /> */}
      </View>
      {/* In case your webchat is not rendered and you want to catch bot messages */}
      <BpIncommingMessagesListener
        botConfig={testingConfig}
        onBotMessage={(event) => {
          console.log("bot message", event);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
});
