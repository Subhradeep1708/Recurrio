import { clsx } from "clsx"
import { Image, View } from "react-native"

export const TabIcon = ({ icon, focused }: TabIconProps) => {
    return (
        <View className="tabs-icon-web">
            <View className={clsx('tabs-pill-web', focused && 'tabs-active')}>
                <Image source={icon} resizeMode="contain" className="tabs-glyph-web" />
                {/* <Text className={clsx('tabs-label', focused && 'tabs-active-label')}>{focused ? 'Active' : 'Inactive'}</Text> */}
            </View>
        </View>
    )
}