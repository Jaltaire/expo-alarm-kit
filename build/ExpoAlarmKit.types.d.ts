import type { StyleProp, ViewStyle } from 'react-native';
export type OnLoadEventPayload = {
    url: string;
};
export type ExpoAlarmKitViewProps = {
    url: string;
    onLoad: (event: {
        nativeEvent: OnLoadEventPayload;
    }) => void;
    style?: StyleProp<ViewStyle>;
};
//# sourceMappingURL=ExpoAlarmKit.types.d.ts.map