import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [name, setName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatHistory = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching chat history:', error);
      } else {
        setMessages(data);
      }
    };

    const fetchName = async () => {
      const { data, error } = await supabase.from('user_profiles')
        .select('name')
        .eq('user_id', user.id);
        
      if (error) {
        console.error(error);
      } else {
        setName(data[0].name);
      }
    };
    
    fetchName();
    fetchChatHistory();
  }, []);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const { error } = await supabase.from('chat_messages').insert([
      { sender_id: name, message: newMessage.trim() },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 16, backgroundColor: 'pink' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
        Chat Messages
      </Text>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 8 }}>
            <Text>{item.sender_id}: {item.message}</Text>
            <Text>Timestamp: {item.timestamp}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 15}}>
        <TextInput
          style={{ flex: 1, marginRight: 8, padding: 8, borderWidth: 1, maxHeight: 100, backgroundColor: 'lavenderblush'}}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline={true}
          // Adjust the height of the TextInput container to make it scrollable
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;