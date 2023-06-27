import { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";
import { Button } from 'react-native-paper';
import { Link } from "expo-router";

const UserProfileTab = () => {
  const [profiles, setProfiles] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch the user profiles from Supabase
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('user_profiles')
      .select('*').eq('user_id', user.id);
      
      if (error) {
        console.error(error);
      } else {
        setProfiles(data);
      }
    };

    fetchProfiles();
  }, []);

  const renderProfileItem = ({ item }) => (
    <View style={{ padding: 30, backgroundColor: 'pink' }}>
      <View style={{alignItems: 'center'}}>
        <Image source={{ uri: item.image_url }} 
        style={{ height: 170, width: 170, borderRadius: 85, borderWidth: 2, borderColor: 'lavenderblush',}} />
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Name</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.name}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Year Of Study</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.year_of_study}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Major</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.major}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Modules</Text>
          <View style={{ height: 44, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, paddingRight: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.modules}</Text>
          </View>
      </View>
      <View style={{flexDirection: "column", marginBottom: 6,}}>
        <Text>Description</Text>
          <View style={{ height: 120, width: "100%", borderColor:'gray',
            borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
            paddingLeft: 8, paddingRight: 8, backgroundColor: 'lavenderblush'}} >
            <Text>{item.description}</Text>
          </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
      {profiles.length ? (
        <View>
          {profiles.map(profile => (
            <View key={profile.id.toString()}>
              {renderProfileItem({ item: profile })}
            </View>
          ))}
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
          <Text>You do not have a profile yet!</Text>
          <Text>Create your profile, then refresh your app to see it</Text>
          <Link href="/editProfile">
            <Button>Create your profile</Button>
          </Link>
        </View>
      )}
    </View>
  );
};
    
export default UserProfileTab;


// import { FlatList, View, Text } from 'react-native';
// import { Link } from "expo-router";
// import { Button } from 'react-native-paper';
// import { useState, useEffect } from "react";
// import { supabase } from '../../lib/supabase';

// export default function ProfileScreen() {
//     const { name, setName } = useState([]);
//     // const { refreshing, setRefreshing } = useState(false);
    
//     async function fetchName() {
//         // setRefreshing(true);
//         let { name } = await supabase.from('user_profiles').select('name');
//         // setRefreshing(false);
//         setName(name);
//     }

//     useEffect(() => {
//         fetchName();
//     }, []);

//     // useEffect(() => {
//     //     if (refreshing) {
//     //         fetchName();
//     //         setRefreshing(false);
//     //     }
//     // }, [refreshing]);

    
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', 
//         alignItems: 'center', backgroundColor: 'pink' }}>
//             <FlatList
//                 data={name}
//                 renderItem={({ item }) => <Text>{item.name}</Text>}
//                 // onRefresh={() => setRefreshing(true)}
//                 // refreshing={refreshing}
//             />
//     )
// }