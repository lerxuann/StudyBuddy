import {View,Text,TouchableOpacity,ScrollView,Image,TextInput,Button, KeyboardAvoidingView, Platform} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/auth";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native-paper";
import { supabase } from "../../lib/supabase";

export default function EditProfile() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [yearOfStudy, setYearOfStudy] = useState("");
    const [major, setMajor] = useState("");
    const [modules, setModules] = useState("");
    const [errMsg, setErrMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
      const fetchProfileData = async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id);
  
        if (error) {
          console.error(error);
        } else if (data.length > 0) {
          const profileData = data[0];
          setName(profileData.name || "");
          setDescription(profileData.description || "");
          setModules(profileData.modules || "");
          setYearOfStudy(profileData.year_of_study !== null ? profileData.year_of_study.toString() : "");
          setMajor(profileData.major || "");
          setSelectedImage(profileData.image_url || null);
        }
      };
  
      fetchProfileData();
    }, []);

    const handleSave = async () => {
        setErrMsg('');
        if (name === '') {
          setErrMsg('Name cannot be empty')
          return;
        }
        if (major === '') {
          setErrMsg('Major cannot be empty')
          return;
        }
        if (major.endsWith(' ')) {
          setErrMsg('Please remove the space at the end of your major');
          return;
        }
        if (!Number.isInteger(yearOfStudy) && yearOfStudy > 5) {
          setErrMsg('Year of study must be an integer less than 6')
          return;
        }
        if (modules === '') {
          setErrMsg('Please fill in the modules you are currently taking')
          return;
        }

        setLoading(true);

        let uploadedImage = null;
        if (selectedImage != null) {
            const { data, error } = await supabase.storage.from('images').upload(`${new Date().getTime()}`, { uri: selectedImage, type: 'jpg', name: 'name.jpg' });

            if (error != null) {
                console.log(error);
                setErrMsg(error.message)
                setLoading(false);
                return;
            }
            
            const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);
            uploadedImage = publicUrl;
        }

        const { error } = await supabase
        .from("user_profiles")
        .upsert(
          { user_id: user.id, name: name, major: major, year_of_study: yearOfStudy, 
            modules: modules, description: description, image_url: uploadedImage },
          { onConflict: ["user_id"] } // Specify the conflict resolution column
        )
        .select();

        if (error != null) {
            setLoading(false);
            console.log(error);
            setErrMsg(error.message);
            return;
        }

        setLoading(false);
        router.push('/editProfile');
    }
  
    const handleImageSelection = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });
      console.log(result)
  
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    };
  
    return (
      <KeyboardAvoidingView
      style={{ flex: 1, padding: 16, backgroundColor: 'pink' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
     
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'pink',
          paddingHorizontal: 22,
        }}
>
        <View
          style={{
            marginHorizontal: 12,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace("/settings")}
            style={{
              position: "absolute",
              left: 0,
            }}
          >
            <MaterialIcons
              name="keyboard-arrow-left"
              size={24}
              color={'black'}
            />
          </TouchableOpacity>
  
          <Text style={{fontSize: 17, lineHeight: 21}}>Edit Profile</Text>
        </View>
  
        <ScrollView>
          <View
            style={{
              alignItems: "center",
              marginVertical: 22,
            }}
          >
            <TouchableOpacity onPress={handleImageSelection}>
              <Image
                source={{ uri: selectedImage }}
                style={{
                  height: 170,
                  width: 170,
                  borderRadius: 85,
                  borderWidth: 2,
                  borderColor: 'lavenderblush',
                }}
              />
  
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 10,
                  zIndex: 9999,
                }}
              >
                <MaterialIcons
                  name="photo-camera"
                  size={32}
                  color={'lavenderblush'}
                />
              </View>
            </TouchableOpacity>
          </View>
  
          <View>
            <View
              style={{
                flexDirection: "column",
                marginBottom: 6,
              }}
            >
              <Text>Name</Text>
              <View
                style={{
                  height: 44,
                  width: "100%",
                  borderColor:'gray',
                  borderWidth: 1,
                  borderRadius: 4,
                  marginVertical: 6,
                  justifyContent: "center",
                  paddingLeft: 8,
                  backgroundColor: 'lavenderblush'
                }}
              >
                <TextInput
                  value={name}
                  onChangeText={(value) => setName(value)}
                  editable={true}
                  placeholder="Enter your name"
                />
              </View>
            </View>
  
            <View
              style={{
                flexDirection: "column",
                marginBottom: 6,
              }}
            >
              <Text>Year Of Study</Text>
              <View
                style={{
                  height: 44,
                  width: "100%",
                  borderColor: 'gray',
                  borderWidth: 1,
                  borderRadius: 4,
                  marginVertical: 6,
                  justifyContent: "center",
                  paddingLeft: 8,
                  backgroundColor: 'lavenderblush'
                }}
              >
                <TextInput
                  value={yearOfStudy}
                  onChangeText={(value) => setYearOfStudy(value)}
                  editable={true}
                  placeholder="Numerics only"
                />
              </View>
            </View>
  
            <View
              style={{
                flexDirection: "column",
                marginBottom: 6,
              }}
            >
              <Text>Major - No abbreviations and Capitalised </Text>
              <View
                style={{
                  height: 44,
                  width: "100%",
                  borderColor: 'gray',
                  borderWidth: 1,
                  borderRadius: 4,
                  marginVertical: 6,
                  justifyContent: "center",
                  paddingLeft: 8,
                  backgroundColor: 'lavenderblush'
                }}
              >
                <TextInput
                  value={major}
                  autoCapitalize = "words"
                  onChangeText={(value) => setMajor(value)}
                  editable={true}
                  placeholder="eg. Communications And New Media"
                />
              </View>
            </View>
          </View>

          <View
              style={{
                flexDirection: "column",
                marginBottom: 6,
              }}
            >
              <Text>Current Courses/Modules</Text>
              <View
                style={{
                  height: 44,
                  width: "100%",
                  borderColor:'gray',
                  borderWidth: 1,
                  borderRadius: 4,
                  marginVertical: 6,
                  justifyContent: "center",
                  paddingLeft: 8,
                  backgroundColor: 'lavenderblush'
                }}
              >
                <TextInput
                  value={modules}
                  onChangeText={(value) => setModules(value)}
                  editable={true}
                  placeholder="eg. GEA1000"
                />
              </View>
            </View>
  
          <View
            style={{
              flexDirection: "column",
              marginBottom: 6,
            }}
          >
            <Text>Description</Text>
            <View
              style={{
                height: 44,
                width: "100%",
                borderColor: 'gray',
                borderWidth: 1,
                borderRadius: 4,
                marginVertical: 6,
                justifyContent: "center",
                paddingLeft: 8,
                backgroundColor: 'lavenderblush'
              }}
            >
              <TextInput
                value={description}
                onChangeText={(value) => setDescription(value)}
                editable={true}
                multiline = {true}
                placeholder="Write a short description about yourself"
              />
            </View>
          </View>
  
        {errMsg !== '' && <Text>{errMsg}</Text>}
        <Button onPress={handleSave} title="Save Changes" />
        {loading && <ActivityIndicator />}
          
        </ScrollView>
      </SafeAreaView>
     </KeyboardAvoidingView>
    );
  }

// import {
//     View,
//     Text,
//     TouchableOpacity,
//     ScrollView,
//     Image,
//     TextInput,
//     Button
//   } from "react-native";
// import { useEffect, useState } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";
// import * as ImagePicker from "expo-image-picker";
// import { MaterialIcons } from "@expo/vector-icons";
// import { useAuth } from "../../contexts/auth";
// import { useRouter } from "expo-router";
// import { ActivityIndicator } from "react-native-paper";
// import { supabase } from "../../lib/supabase";
  
// export default function EditProfile() {
//     const [selectedImage, setSelectedImage] = useState(null);
//     const [name, setName] = useState("");
//     const [description, setDescription] = useState("");
//     const [yearOfStudy, setYearOfStudy] = useState("");
//     const [major, setMajor] = useState("");
//     const [modules, setModules] = useState("");
//     const [errMsg, setErrMsg] = useState('');
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();
//     const { user } = useAuth();

//     useEffect(() => {
//       const fetchProfileData = async () => {
//         const { data, error } = await supabase
//           .from('user_profiles')
//           .select('*')
//           .eq('user_id', user.id);
  
//         if (error) {
//           console.error(error);
//         } else if (data.length > 0) {
//           const profileData = data[0];
//           setName(profileData.name || "");
//           setDescription(profileData.description || "");
//           setModules(profileData.modules || "");
//           setYearOfStudy(profileData.year_of_study !== null ? profileData.year_of_study.toString() : "");
//           setMajor(profileData.major || "");
//           setSelectedImage(profileData.image_url || null);
//         }
//       };
  
//       fetchProfileData();
//     }, []);

//     const handleSave = async () => {
//         setErrMsg('');
//         if (name === '') {
//           setErrMsg('Name cannot be empty')
//           return;
//         }
//         if (major === '') {
//           setErrMsg('Major cannot be empty')
//           return;
//         }
//         if (!Number.isInteger(yearOfStudy) && yearOfStudy > 5) {
//           setErrMsg('Year of study must be an integer less than 6')
//           return;
//         }
//         if (modules === '') {
//           setErrMsg('Please fill in the modules you are currently taking')
//           return;
//         }

//         setLoading(true);

//         let uploadedImage = null;
//         if (selectedImage != null) {
//             const { data, error } = await supabase.storage.from('images').upload(`${new Date().getTime()}`, { uri: selectedImage, type: 'jpg', name: 'name.jpg' });

//             if (error != null) {
//                 console.log(error);
//                 setErrMsg(error.message)
//                 setLoading(false);
//                 return;
//             }
            
//             const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(data.path);
//             uploadedImage = publicUrl;
//         }

//         const { error } = await supabase
//         .from("user_profiles")
//         .upsert(
//           { user_id: user.id, name: name, major: major, year_of_study: yearOfStudy, 
//             modules: modules, description: description, image_url: uploadedImage },
//           { onConflict: ["user_id"] } // Specify the conflict resolution column
//         )
//         .select();

//         if (error != null) {
//             setLoading(false);
//             console.log(error);
//             setErrMsg(error.message);
//             return;
//         }

//         setLoading(false);
//         router.push('/profile');
//     }
  
//     const handleImageSelection = async () => {
//       let result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 4],
//         quality: 1,
//       });

//       console.log(result)
  
//       if (!result.canceled) {
//         setSelectedImage(result.assets[0].uri);
//       }
//     };
  
//     return (
//       <SafeAreaView
//         style={{
//           flex: 1,
//           backgroundColor: 'pink',
//           paddingHorizontal: 22,
//         }}
// >
//         <View
//           style={{
//             marginHorizontal: 12,
//             flexDirection: "row",
//             justifyContent: "center",
//           }}
//         >
//           <TouchableOpacity
//             onPress={() => router.replace("/settings")}
//             style={{
//               position: "absolute",
//               left: 0,
//             }}
//           >
//             <MaterialIcons
//               name="keyboard-arrow-left"
//               size={24}
//               color={'black'}
//             />
//           </TouchableOpacity>
  
//           <Text style={{fontSize: 17, lineHeight: 21}}>Edit Profile</Text>
//         </View>
  
//         <ScrollView>
//           <View
//             style={{
//               alignItems: "center",
//               marginVertical: 22,
//             }}
//           >
//             <TouchableOpacity onPress={handleImageSelection}>
//               <Image
//                 source={{ uri: selectedImage }}
//                 style={{
//                   height: 170,
//                   width: 170,
//                   borderRadius: 85,
//                   borderWidth: 2,
//                   borderColor: 'lavenderblush',
//                 }}
//               />
  
//               <View
//                 style={{
//                   position: "absolute",
//                   bottom: 0,
//                   right: 10,
//                   zIndex: 9999,
//                 }}
//               >
//                 <MaterialIcons
//                   name="photo-camera"
//                   size={32}
//                   color={'lavenderblush'}
//                 />
//               </View>
//             </TouchableOpacity>
//           </View>
  
//           <View>
//             <View
//               style={{
//                 flexDirection: "column",
//                 marginBottom: 6,
//               }}
//             >
//               <Text>Name</Text>
//               <View
//                 style={{
//                   height: 44,
//                   width: "100%",
//                   borderColor:'gray',
//                   borderWidth: 1,
//                   borderRadius: 4,
//                   marginVertical: 6,
//                   justifyContent: "center",
//                   paddingLeft: 8,
//                   backgroundColor: 'lavenderblush'
//                 }}
//               >
//                 <TextInput
//                   value={name}
//                   onChangeText={(value) => setName(value)}
//                   editable={true}
//                 />
//               </View>
//             </View>
  
//             <View
//               style={{
//                 flexDirection: "column",
//                 marginBottom: 6,
//               }}
//             >
//               <Text>Year Of Study</Text>
//               <View
//                 style={{
//                   height: 44,
//                   width: "100%",
//                   borderColor: 'gray',
//                   borderWidth: 1,
//                   borderRadius: 4,
//                   marginVertical: 6,
//                   justifyContent: "center",
//                   paddingLeft: 8,
//                   backgroundColor: 'lavenderblush'
//                 }}
//               >
//                 <TextInput
//                   value={yearOfStudy}
//                   onChangeText={(value) => setYearOfStudy(value)}
//                   editable={true}
//                 />
//               </View>
//             </View>
  
//             <View
//               style={{
//                 flexDirection: "column",
//                 marginBottom: 6,
//               }}
//             >
//               <Text>Major</Text>
//               <Text>no abbreviations and capitalise the first letter of every word, eg. Communications And New Media</Text>
//               <View
//                 style={{
//                   height: 44,
//                   width: "100%",
//                   borderColor: 'gray',
//                   borderWidth: 1,
//                   borderRadius: 4,
//                   marginVertical: 6,
//                   justifyContent: "center",
//                   paddingLeft: 8,
//                   backgroundColor: 'lavenderblush'
//                 }}
//               >
//                 <TextInput
//                   value={major}
//                   onChangeText={(value) => setMajor(value)}
//                   editable={true}
//                 />
//               </View>
//             </View>
//           </View>

//           <View
//               style={{
//                 flexDirection: "column",
//                 marginBottom: 6,
//               }}
//             >
//               <Text>Current Courses/Modules</Text>
//               <View
//                 style={{
//                   height: 44,
//                   width: "100%",
//                   borderColor:'gray',
//                   borderWidth: 1,
//                   borderRadius: 4,
//                   marginVertical: 6,
//                   justifyContent: "center",
//                   paddingLeft: 8,
//                   backgroundColor: 'lavenderblush'
//                 }}
//               >
//                 <TextInput
//                   value={modules}
//                   onChangeText={(value) => setModules(value)}
//                   editable={true}
//                 />
//               </View>
//             </View>
  
//           <View
//             style={{
//               flexDirection: "column",
//               marginBottom: 6,
//             }}
//           >
//             <Text>Description</Text>
//             <View
//               style={{
//                 height: 44,
//                 width: "100%",
//                 borderColor: 'gray',
//                 borderWidth: 1,
//                 borderRadius: 4,
//                 marginVertical: 6,
//                 justifyContent: "center",
//                 paddingLeft: 8,
//                 backgroundColor: 'lavenderblush'
//               }}
//             >
//               <TextInput
//                 value={description}
//                 onChangeText={(value) => setDescription(value)}
//                 editable={true}
//               />
//             </View>
//           </View>
  
//         {errMsg !== '' && <Text>{errMsg}</Text>}
//         <Button onPress={handleSave} title="Save Changes" />
//         {loading && <ActivityIndicator />}
          
//         </ScrollView>
//       </SafeAreaView>
//     );
//   }
