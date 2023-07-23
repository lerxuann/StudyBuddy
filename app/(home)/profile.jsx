import { View, Text, Image, ScrollView, RefreshControl, Modal, TouchableOpacity } from 'react-native';
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/auth";
import { Button } from 'react-native-paper';
import { Link } from "expo-router";
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const UserProfileTab = () => {
  const [profiles, setProfiles] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // Track the refreshing state
  const { user } = useAuth();
  const [showHelpModal, setShowHelpModal] = useState(false);

  //fetch user profile to display
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
    } else {
      setProfiles(data);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true); // Start the refreshing state
    fetchProfiles();
    setRefreshing(false); // End the refreshing state
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleHelpIconPress = () => {
    setShowHelpModal(true); //open modal if help icon is pressed
  };

  const handleCloseHelpModal = () => {
    setShowHelpModal(false); //exit modal
  };

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
       <View style={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
          <TouchableOpacity onPress={handleHelpIconPress} style={{padding: 10}}>
            <Ionicons name="help-circle-outline" size={24} color="black" />
          </TouchableOpacity>
      </View>
    {profiles.length ? (
      //usual view
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {profiles.map(profile => (
          <View key={profile.id.toString()}>
            {renderProfileItem({ item: profile })}
          </View>
        ))}
      </ScrollView>
    ) : (
      //if user has not created their profile yet
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
        <Text>You do not have a profile yet!</Text>
        <Text>Create your profile, then refresh your app to see it</Text>
        <Link href="../(settings)/editProfile">
          <Button>Create your profile</Button>
        </Link>
      </View>
    )}
     <Modal visible={showHelpModal} animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'mistyrose' }}>
          <Text style={{ textAlign: 'center', marginBottom: 5, padding:10, fontSize: 20, fontWeight: 'bold' }}>
            Welcome to your profile!
          </Text>
          <Text style={{ textAlign: 'center', marginBottom: 5, padding: 10 }}>
            This is where you will be able to view your own profile.
          </Text>
          <Text style={{ textAlign: 'center', padding: 10 }}>
             To change your profile, please
            <Link href="../(settings)/editProfile">
              <Text style={{fontWeight: 'bold' }}> click here!</Text>
            </Link>
          </Text>
          <Button onPress={() => handleCloseHelpModal()}>Got it!</Button>
        </View>
      </Modal>
  </View>
  );
};
    
export default UserProfileTab;

// import { View, Text, Image, ScrollView } from 'react-native';
// import { supabase } from "../../lib/supabase";
// import { useAuth } from "../../contexts/auth";
// import { Button } from 'react-native-paper';
// import { Link } from "expo-router";
// import { useEffect, useState } from 'react';
// const UserProfileTab = () => {
//   const [profiles, setProfiles] = useState([]);
//   const { user } = useAuth();

//   useEffect(() => {


//     const fetchProfiles = async () => {
//       const { data, error } = await supabase.from('user_profiles')
//         .select('*').eq('user_id', user.id);

//       if (error) {
//         console.error(error);
//       } else {
//         setProfiles(data);
//       }
//     };
//     const channel = supabase
//       .channel('schema-db-changes')
//       .on(
//         'postgres_changes',
//         {
//           event: 'INSERT',
//           schema: 'public',
//           table: 'user_profiles',
//           condition: `new.user_id = '${user.id}'`, // Filter changes by user_id
//         },
//         (payload) => {
//           const { new: newProfile, old: oldProfile, event_type } = payload;

//           if (event_type === 'INSERT') {
//             setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
//           } else if (event_type === 'UPDATE') {
//             setProfiles((prevProfiles) =>
//               prevProfiles.map((profile) =>
//                 profile.id === newProfile.id ? newProfile : profile
//               )
//             );
//           } else if (event_type === 'DELETE') {
//             setProfiles((prevProfiles) =>
//               prevProfiles.filter((profile) => profile.id !== oldProfile.id)
//             );
//           }
//         }
//       )
//       .subscribe();

//     // Fetch the initial user profiles
//     fetchProfiles();

//     // Clean up the channel subscription when the component unmounts
//     return () => {
//       channel.unsubscribe();
//     };
//   }, []);



//   const renderProfileItem = ({ item }) => (
//     <View style={{ padding: 30, backgroundColor: 'pink' }}>
//       <View style={{alignItems: 'center'}}>
//         <Image source={{ uri: item.image_url }} 
//         style={{ height: 170, width: 170, borderRadius: 85, borderWidth: 2, borderColor: 'lavenderblush',}} />
//       </View>
//       <View style={{flexDirection: "column", marginBottom: 6,}}>
//         <Text>Name</Text>
//           <View style={{ height: 44, width: "100%", borderColor:'gray',
//             borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
//             paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
//             <Text>{item.name}</Text>
//           </View>
//       </View>
//       <View style={{flexDirection: "column", marginBottom: 6,}}>
//         <Text>Year Of Study</Text>
//           <View style={{ height: 44, width: "100%", borderColor:'gray',
//             borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
//             paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
//             <Text>{item.year_of_study}</Text>
//           </View>
//       </View>
//       <View style={{flexDirection: "column", marginBottom: 6,}}>
//         <Text>Major</Text>
//           <View style={{ height: 44, width: "100%", borderColor:'gray',
//             borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
//             paddingLeft: 8, backgroundColor: 'lavenderblush'}} >
//             <Text>{item.major}</Text>
//           </View>
//       </View>
//       <View style={{flexDirection: "column", marginBottom: 6,}}>
//         <Text>Modules</Text>
//           <View style={{ height: 44, width: "100%", borderColor:'gray',
//             borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
//             paddingLeft: 8, paddingRight: 8, backgroundColor: 'lavenderblush'}} >
//             <Text>{item.modules}</Text>
//           </View>
//       </View>
//       <View style={{flexDirection: "column", marginBottom: 6,}}>
//         <Text>Description</Text>
//           <View style={{ height: 120, width: "100%", borderColor:'gray',
//             borderWidth: 1, borderRadius: 4, marginVertical: 6, justifyContent: "center",
//             paddingLeft: 8, paddingRight: 8, backgroundColor: 'lavenderblush'}} >
// <Text>{item.description}</Text>
//           </View>
//       </View>
//     </View>
//   );

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
//       {profiles.length ? (
//         <ScrollView>
//           {profiles.map(profile => (
//             <View key={profile.id.toString()}>
//               {renderProfileItem({ item: profile })}
//             </View>
//           ))}
//         </ScrollView>
//       ) : (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'pink' }}>
//           <Text>You do not have a profile yet!</Text>
//           <Text>Create your profile, then refresh your app to see it</Text>
//           <Link href="/editProfile">
//             <Button>Create your profile</Button>
//           </Link>
//         </View>
//       )}
//     </View>
//   );
// };
    
// export default UserProfileTab;