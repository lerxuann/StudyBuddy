import { View, Image, KeyboardAvoidingView , Platform} from "react-native";
import { useState } from "react";
import { Text, TextInput, Button, ActivityIndicator } from "react-native-paper";
import {Link}  from "expo-router";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState('');
    const handleSubmit = async () => {
        setErrMsg('');
        if (email == '') {
            setErrMsg("email cannot be empty")
            return;
        }
        if (password == '') {
            setErrMsg("password cannot be empty")
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            setErrMsg(error.message);
            return;
        }
    }
    return (
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink', }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Image source={require('./images/studybuddy.png')}  style={{ width: 150, height: 150, marginBottom: 20 }}/>
            <View style={{ marginBottom: 10}}>
            <Text style= {{textAlign: 'center'}}>Email</Text> 
            <View style={{ marginTop: 5 }}>
            <TextInput
                autoCapitalize='none'
                textContentType='emailAddress'
                value={email}
                onChangeText={setEmail} />
                </View>
            </View>
            <View style={{ marginBottom: 10}}>
            <Text style= {{textAlign: 'center'}}>Password</Text>
            <View style={{ marginTop: 5 }}>
            <TextInput
                secureTextEntry
                autoCapitalize='none'
                textContentType='password'
                value={password}
                onChangeText={setPassword} />
                </View>
            </View>
            <Button onPress={handleSubmit}>Sign in</Button>
            {errMsg !== "" && <Text>{errMsg}</Text>}
            {loading && <ActivityIndicator />}
            <View style={{ marginBottom: 10}}>
            <Link href="/register">
                <Button> No account? Register here! </Button>
            </Link>
            </View>
        </KeyboardAvoidingView>
    )
}
