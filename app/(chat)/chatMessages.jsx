import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";
import { useLocalSearchParams,  Link} from 'expo-router';
import {Button } from 'react-native-paper';
import moment from 'moment';



const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [name, setName] = useState('');
  const { user } = useAuth();
  const { chatId, receiverName } = useLocalSearchParams();
  


  const fetchChatHistory = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_id', chatId )
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
    } else {
      setMessages(data);
    }
  };

  const fetchName = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
    } else {
      setName(data[0].name);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchName(), fetchChatHistory()]);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
        },
        (payload) => console.log(payload)
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
  
    const { error } = await supabase.from('chat_messages').insert([
      { chat_id: chatId, sender_id: name, message: newMessage.trim() },
    ]);
   
    if (error) {
      console.error('Error sending message:', error);
    } else {
      // Update the messages state with the new message
      const newMessageObj = { sender_id: name, message: newMessage.trim() };
      setMessages((prevMessages) => [...prevMessages, newMessageObj]);
      setNewMessage('');
    }
  };
 

  

  return (
  
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 16, backgroundColor: 'pink' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
   
   <View style={{ marginBottom: 0, marginTop: 25 }}>
      <Link href="/chat">
        <Button>Back</Button>
      </Link>
    </View>

    <View style={{marginBottom: 8,  marginTop: 2, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
         {receiverName}
      </Text>
    </View>
 <FlatList
  data={messages}
  renderItem={({ item }) => (
    messages.length > 0 && (
    <View
      style={{
        marginBottom: 8, marginTop: 8,
        alignSelf: item.sender_id === name? 'flex-end' : 'flex-start',
        paddingHorizontal: 16, // Add padding horizontally
        maxWidth: '80%', // Limit the maximum width of messages
      }}
    >
      <Text
        style={{
          textAlign: item.sender_id === name ? 'left' : 'left',
          backgroundColor: item.sender_id === name? '#DCF8C6' : '#F1F0F0', // Add background color to differentiate messages
          padding: 8, // Add padding for each message
          borderRadius: 8, // Add border radius to make messages appear as bubbles
        }}
      >
         {item.message}
      </Text>
      <Text
        style={{
          textAlign: item.sender_id === name ? 'right' : 'left',
          marginTop: 4, // Add margin top for timestamp
          fontSize: 12, // Reduce font size for timestamp
          color: 'gray', // Customize the color of the timestamp
        }}
      >
         {moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
      </Text>
    </View>
  )
  )}
  keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
/>


   
      <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 30}}>
        <TextInput
          style={{ flex: 1, marginRight: 8, padding: 10, borderWidth: 1, maxHeight: 100, backgroundColor: 'lavenderblush'}}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline={true}
          // Adjust the height of the TextInput container to make it scrollable
        />
       
    <Button onPress={handleSendMessage}>
        Send
    </Button>
          
      </View>
       
       
    </KeyboardAvoidingView>
  
  );
};

export default ChatScreen;