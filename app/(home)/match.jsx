import { View, Text, ScrollView, Image, Button } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { useAuth } from "../../contexts/auth";
import { useRouter } from "expo-router";

export default function MatchScreen() {
    const [profiles, setProfiles] = useState([]);
    const { user } = useAuth();
    const [major, setMajor] = useState(null);
    const [name, setName] = useState('');
    const router = useRouter();
  
    useEffect(() => {
      const fetchMajor = async () => {
        const { data, error } = await supabase.from('user_profiles')
        .select('major').eq('user_id', user.id);
        
        if (error) { console.error(error);
        } else { setMajor(data[0].major); }
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
      fetchMajor();
    }, []);

    useEffect(() => {
      // Fetch the user profiles from Supabase
      const fetchMatchingProfiles = async () => {
        const { data, error } = await supabase.from('user_profiles')
        .select('*').neq('user_id', user.id).eq('major', major);
        
        if (error) {
          console.error(error);
        } else {
          setProfiles(data);
        }
      };
  
      fetchMatchingProfiles();
    }, [major]);

    const startChat = async ( receiverId, receiverName ) => {
      let firstParticipant, secondParticipant;
      if (user.id < receiverId ) {
        firstParticipant = user.id;
        secondParticipant = receiverId;
      } else {
        firstParticipant = receiverId;
        secondParticipant = user.id;
      }

      const { error } = await supabase.from("chats")
      .upsert(
        { participants_id: [firstParticipant, secondParticipant], receiver_name: receiverName, sender_name: name },
        { onConflict: 'participants_id'}
      ).select();
      
      if (error) {
        console.error(error);
      }
      router.push('/chat');
    };
  
    const renderProfileItem = ({ item }) => (
      <View style={{ padding: 10, backgroundColor: 'pink', alignItems: 'center' }}>
        <View style={{alignItems: 'center'}}>
        <Image source={{ uri: item.image_url }} 
        style={{ height: 170, width: 170, borderRadius: 85, borderWidth: 1, borderColor: 'white', marginBottom: 10}} />
        </View>
        <Text>Name: {item.name}</Text>
        <Text>Year of Study: {item.year_of_study}</Text>
        <Text>Major: {item.major}</Text>
        <Text>Modules: {item.modules}</Text>
        <Text>Description: {item.description}</Text>
        <Button title="Study together?" onPress={() => startChat(item.user_id, item.name)} />
      </View>
    );
  
    return (
      <View style={{ flex: 1, justifyContent: 'center', 
      alignItems: 'center', backgroundColor: 'pink' }}>
      {profiles.length ? (
        <ScrollView>
        {profiles.map((profile, index) => (
          <View key={index}>
            {renderProfileItem({ item: profile })}
          </View>
        ))}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
          <Text>We cannot find other users with the same major as you :(</Text>
          <Text>Try again later!</Text>
        </View>
      )}
    </View>
    );
}
