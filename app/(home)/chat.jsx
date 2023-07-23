import { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TextInput, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [name, setName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false); // Track the refreshing state
  const [showHelpModal, setShowHelpModal] = useState(false);
  const { user } = useAuth();

  //fetch all chats that the user has
  const fetchChatHistory = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .overlaps('participants_id', [user.id]) //fetch as long as user is one of the participants
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching chat history:', error);
    } else {
      setChats(data);
    }
  };

  //fetch name of current user
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

  const handleRefresh = async () => {
    setRefreshing(true); // Start the refreshing state
    try {
      await fetchName();
      await fetchChatHistory();
    } catch (error) {
      console.error('Error refreshing chats', error);
    }
    setRefreshing(false); // End the refreshing state
  };

  useEffect(() => {
    fetchName();
    fetchChatHistory();
  }, []);

  //display the chats as the name of the other participant (ie not the user)
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

  const handleHelpIconPress = () => {
    setShowHelpModal(true); //show modal if help icon is pressed
  };

  const handleCloseHelpModal = () => {
    setShowHelpModal(false); //exit modal
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
          <Text style={{ fontSize: 16 }}>{name === item.sender_name ? item.receiver_name : item.sender_name}</Text>
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
      <View style={{ position: 'absolute', top: 2, right: 20, zIndex: 1 }}>
          <TouchableOpacity onPress={handleHelpIconPress} style={{padding: 10}}>
            <Ionicons name="help-circle-outline" size={24} color="black" />
          </TouchableOpacity>
      </View>
      <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>
        Click on the chats below to talk!
      </Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: 'gray', padding: 8, marginBottom: 8, backgroundColor: 'lavenderblush' }}
        placeholder="Search chats"
        value={searchText}
        onChangeText={setSearchText}
      />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {chats.length ? (
          //usual display
          filterChats().map((chat, index) => (
            <View key={index}>
              {renderChats({ item: chat })}
            </View>
          ))
        ) : (
          //if no chats
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
            <Text>No chats right now :(</Text>
            <Text>Find new study buddies under the Match tab!</Text>
          </View>
        )}
        <Modal visible={showHelpModal} animationType="slide">
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'mistyrose' }}>
          <Text style={{ textAlign: 'center', marginBottom: 5, padding:10, fontSize: 20, fontWeight: 'bold' }}>
            Welcome to the Chat page!
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 5, padding: 10 }}>
            This is where you will be shown other users whom you have chats with. Upon entering the chat, you can click on the other user's name to view their profile.
          </Text>
          <Text style={{ textAlign: 'center', padding: 10 }}>
            If a new chat that you have started is not showing up, please drag down to refresh the page!
          </Text>
          <Button onPress={() => handleCloseHelpModal()}>Got it!</Button>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

// import { useState, useEffect } from 'react';
// import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
// import { supabase } from "../../lib/supabase";
// import { useAuth } from "../../contexts/auth";
// import { Link } from 'expo-router';

// const ChatScreen = () => {
//   const [chats, setChats] = useState([]);
//   const [name, setName] = useState('');
//   const [searchText, setSearchText] = useState('');
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchChatHistory = async () => {
//       const { data, error } = await supabase
//         .from('chats')
//         .select('*')
//         .overlaps('participants_id', [user.id])
//         .order('created_at', { ascending: true });

//       if (error) {
//         console.error('Error fetching chat history:', error);
//       } else {
//         setChats(data);
//       }
//     };

//     const fetchName = async () => {
//       const { data, error } = await supabase.from('user_profiles')
//         .select('name')
//         .eq('user_id', user.id);
        
//       if (error) {
//         console.error(error);
//       } else {
//         setName(data[0].name);
//       }
//     };
    
//     fetchName();
//     fetchChatHistory();
//   }, []);

//   const filterChats = () => {
//     if (searchText.trim() === '') {
//       return chats;
//     }

//     const filteredChats = chats.filter((chat) => {
//       const participantName = name === chat.sender_name ? chat.receiver_name : chat.sender_name;
//       return participantName.toLowerCase().includes(searchText.toLowerCase());
//     });

//     return filteredChats;
//   };

//   const renderChats = ({ item }) => (
//     <View>
//       <View style={{ padding: 10, backgroundColor: 'pink', alignItems: 'center' }}>
//         <Link
//           href={{
//             pathname: "/chatMessages",
//             params: { chatId: item.chat_id, receiverName: name === item.sender_name ? item.receiver_name : item.sender_name }
//           }}
//         >
//           <Text style={{ fontSize: 16 }}>{name === item.sender_name ? item.receiver_name : item.sender_name}</Text>
//         </Link>
//       </View>
//       <View style={{ height: 1, backgroundColor: 'black', marginVertical: 8, marginLeft: 0 }} />
//     </View>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, padding: 16, backgroundColor: 'pink' }}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
//     >
//       <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>
//         Click on the chats below to talk!
//       </Text>
//       <TextInput
//         style={{ borderWidth: 1, borderColor: 'gray', padding: 8, marginBottom: 8, backgroundColor: 'lavenderblush' }}
//         placeholder="Search chats"
//         value={searchText}
//         onChangeText={setSearchText}
//       />
//       {chats.length ? (
//         <ScrollView>
//         {filterChats().map((chat, index) => (
//           <View key={index}>
//             {renderChats({ item: chat })}
//           </View>
//         ))}
//         </ScrollView>
//       ) : (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
//           <Text>No chats right now :(</Text>
//           <Text>Find new study buddies under the Match tab!</Text>
//         </View>
//       )}
//     </KeyboardAvoidingView>
//   );
// };

// export default ChatScreen;