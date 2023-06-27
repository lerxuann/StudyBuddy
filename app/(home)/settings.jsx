import { View } from 'react-native';
import { Link } from "expo-router";
import { supabase } from '../../lib/supabase';
import { Button } from 'react-native-paper';

export default function ProfileScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', 
        alignItems: 'center', backgroundColor: 'pink' }}>
            <Link href="/editProfile">
                <Button>Edit Profile</Button>
            </Link>
            <Button onPress={() => supabase.auth.signOut()}>Logout</Button>
        </View>
    )
}
