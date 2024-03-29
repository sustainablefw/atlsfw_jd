import React, { useState } from 'react';
import { Button, Text, TextInput, View, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import encryptWithPublicKey from '../utils/encryptionUtils.mjs';
import hashString from '../utils/hashingUtils.mjs';
import MY_IP_ADDRESS from '../environment_variables.mjs';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '../redux/actions/loginAction';
import { setID } from '../redux/actions/idAction';
import { get_like_list } from '../redux/actions/likeAction';
import { get_save_list } from '../redux/actions/saveAction';
import { set_acct_type } from '../redux/actions/accountAction';
import { setUserInfo } from '../redux/actions/userInfoAction';
import { getVend } from '../redux/actions/vendAction';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [counter, setCounter] = useState(0);

  //redux stuff
  const dispatch = useDispatch();
 
  const isLogged = useSelector((store) => store.isLogged.isLogged);
  const user_id = useSelector((store) => store.user_id.user_id);
  const account_type = useSelector((store) => store.acct_type.acct_type);

  const handleLogin = async () => {
    try {

      const hashed_email = await hashString(email);
      const hashed_password = await hashString(password);

      // Send the user data to your backend
      const response = await axios.post('http://' + MY_IP_ADDRESS + ':5050/', {
          hashed_email,
          hashed_password,
        });

      const data = response.data;

      if (data.success) {
 
          // SET REDUX STATES

          //send login action to store
          dispatch(login());
          //set user ID to store
          dispatch(setID(data.user._id));
          // set userInfo
          dispatch(setUserInfo(data.user));
          // set vendor initialized boolean state
          dispatch(getVend(data.user.vendor_account_initialized));

          // get previously liked and saved articles list if it exists
          if (data.user.liked_articles != null) {
            dispatch(get_like_list(data.user.liked_articles));
          }
          if (data.user.saved_articles != null) {
            dispatch(get_save_list(data.user.saved_articles));
          }

          //set account type
          dispatch(set_acct_type(data.account_type));

        // Handle success (e.g., navigate to another screen)
        navigation.reset({ index: 0, routes: [{ name: 'Community' }], });
      }
    } catch (error) {
      console.error('Error during login:', error.response.data.message);
        Alert.alert('Login Error', error.response.data.message,
          [{text:'Try Again',
            cancelable: true,
            },
          ],
        );
    }
  };
/* Login to Your Account */


  return (

    <View style={styles.container}>
      <Text style={{...styles.text, paddingBottom: 10}}>Log In</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button 
          title="Login"
          color="black"
          onPress={handleLogin} />
      </View>
      {/* {isLogged ? <Text>logged in</Text> : <Text>not logged in</Text>} */}
      <Text style={styles.text}>New here?</Text>

      <View>
        <Button 
          title="Sign up here!"
          color="green"
          onPress={() => navigation.navigate('Sign Up')}
        />
      </View>
      
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 60,
  },
  buttonContainer: {
    marginRight:90,
    marginLeft:90,
    marginTop:0,
    paddingTop:1,
    paddingBottom:1,
    backgroundColor:'lightgray',
    borderRadius:8,
    borderWidth: 1,
    borderColor: 'black',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
    paddingTop: 70,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius:8,
    marginBottom: 12,
    padding: 8,
  },
});

export default LoginScreen;