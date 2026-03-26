import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs initialRouteName="home">
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: () => <IconSymbol name="house.fill" color="black" />,
          headerRight: () => (
            <MaterialIcons
              name="logout"
              size={28}
              color="#2a4d69"
              style={{ marginRight: 16 }}
              onPress={async () => {
                try {
                  router.replace('/login');
                } catch (error) {
                  Alert.alert('Error', 'Failed to logout.');
                }
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ncbi"
        options={{
          title: 'NCBI',
          tabBarIcon: () => <IconSymbol name="magnifyingglass" color="black" size={28} />, // This icon is not mapped in IconSymbol.tsx
        }}
      />
      <Tabs.Screen
        name="embl"
        options={{
          title: 'CHEMBL',
          tabBarIcon: () => <IconSymbol name="doc.text.magnifyingglass" color="black" size={28} />, // This icon is not mapped in IconSymbol.tsx
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <IconSymbol name="person.crop.circle" color="black" size={28} />, // This icon is not mapped in IconSymbol.tsx
        }}
      />
    </Tabs>
  );
}
