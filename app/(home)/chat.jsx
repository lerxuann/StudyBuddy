import { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";
import { Link } from 'expo-router';

const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [name, setName] = useState('');
  const [searchText, setSearchText] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchChatHistory = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .overlaps('participants_id', [user.id])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat history:', error);
      } else {
        setChats(data);
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

  const filterChats = () => {
    if (searchText.trim() === '') {
      return chats;
    }

    const filteredChats = chats.filter((chat) => {
      const participantName = name === chat.sender_name ? chat.receiver_name : chat.sender_name;
      return participantName.toLowerCase().includes(searchText.toLowerCase());
    });

    return filteredChats;
  };

  const renderChats = ({ item }) => (
    <View>
      <View style={{ padding: 10, backgroundColor: 'pink', alignItems: 'center' }}>
        <Link
          href={{
            pathname: "/chatMessages",
            params: { chatId: item.chat_id, receiverName: name === item.sender_name ? item.receiver_name : item.sender_name }
          }}
        >
          <Text style={{ fontSize: 15 }}>{name === item.sender_name ? item.receiver_name : item.sender_name}</Text>
        </Link>
      </View>
      <View style={{ height: 1, backgroundColor: 'black', marginVertical: 8, marginLeft: 0 }} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, padding: 16, backgroundColor: 'pink' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>
        Click on the chats below to talk!
      </Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', padding: 8, marginBottom: 8, backgroundColor: 'lavenderblush' }}
        placeholder="Search chats"
        value={searchText}
        onChangeText={setSearchText}
      />
      {chats.length ? (
        <ScrollView>
        {filterChats().map((chat, index) => (
          <View key={index}>
            {renderChats({ item: chat })}
          </View>
        ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
          <Text>No chats right now :(</Text>
          <Text>Find new study buddies under the Match tab!</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;