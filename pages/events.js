import React, { useState, useEffect } from 'react'
import {
    Flex,
    Heading,
    InputGroup,
    InputLeftElement,
    Input,
    Button,
    Text,
    IconButton,
    Divider,
} from "@chakra-ui/react"
import { AddIcon, DeleteIcon, StarIcon } from "@chakra-ui/icons"
import DarkModeSwitch from '../components/DarkModeSwitch'
import {
    useAuthUser,
    withAuthUser,
    withAuthUserTokenSSR,
    AuthAction,
} from 'next-firebase-auth'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import firebase from 'firebase/app'
import 'firebase/firestore'

const Event = () => {
    const AuthUser = useAuthUser()
    const [inputName, setInputName] = useState('')
    const [inputDate, setInputDate] = useState('')

    // format of a React Hook: useState function
    // stateVariableName, SetterFunction, = useState(initialValue)
    const [events, setEvents] = useState([])
    // this does the same, but makes an array that will be populated when data is loaded from the database


    useEffect(() => {
        AuthUser.id &&
            firebase
                .firestore()
                .collection("events")
                .where('user', '==', AuthUser.id)
                .onSnapshot(
                  snapshot => {
                    setEvents(
                      snapshot.docs.map(
                        doc => {
                          return{
                            eventID: doc.id,
                            eventName: doc.data().name,
                            eventDate: doc.data().date.toDate().toDateString(),

                          }

                        }
                      )
                    );
                })
    })

    const sendData = () => {
        try {
            // try to update doc
            firebase
                .firestore()
                .collection("events") // this time we're using one collection

                .add({
                    name: inputName,
                    date: firebase.firestore.Timestamp.fromDate(new Date(inputDate)),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    user: AuthUser.id
                })
                .then(console.log('Data was successfully sent to cloud firestore!'))
                //resetting the name and date values since we saved them to already
                setInputName('');
                setInputDate('');
                
        } catch (error) {
            console.log(error)
        }
    }

    const deleteEvent = (t) => {
        try {
            firebase
                .firestore()
                .collection("events")
                .doc(t)
                .delete()
                .then(console.log('Data was successfully deleted!'))
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <Flex flexDir="column" maxW={800} align="center" justify="center" minH="100vh" m="auto" px={4}>
            <Flex justify="space-between" w="100%" align="center">
                <Heading mb={4}>Welcome, {AuthUser.email}!</Heading>
                <Flex>
                    <DarkModeSwitch />
                    <IconButton ml={2} onClick={AuthUser.signOut} icon={<StarIcon />} />
                </Flex>
            </Flex>

                <InputGroup>
                    <InputLeftElement
                        pointerEvents="none"
                        children={<AddIcon color="gray.300" />}
                    />
                    <Input type="text" value={inputName} onChange={(e) => setInputName(e.target.value)} placeholder="Event title" />
                    <Input type="date" value={inputDate} onChange={(e) => setInputDate(e.target.value)} placeholder="Event date" />
                    
                    <Button
                        ml={2}
                        onClick={() => sendData()}

                    >
                        Add Event
                    </Button>
                </InputGroup>
                {events.map((item, i) => {
                return (
                    <React.Fragment key={i}>
                        {i > 0 && <Divider />}
                        <Flex
                            key={i}
                            w="100%"
                            p={5}
                            my={2}
                            align="center"
                            borderRadius={5}
                            justifyContent="space-between"
                        >
                            <Flex align="center">
                                <Text fontSize="xl" mr={4}>{i + 1}.</Text>
                                <Text>{item.eventName}</Text>
                                <Text>... {item.eventDate}</Text>

                            </Flex>
                            <IconButton onClick={() => deleteEvent(item.eventID)} icon={<DeleteIcon />} />
                        </Flex>
                    </React.Fragment>
                )
            })}
        </Flex>
        
    )
}


export const getServerSideProps = withAuthUserTokenSSR({
    whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser, req }) => {
    
    return {
        props: {

        }
    }
})
// this is from the Auth project we're building off it. Ensures that we only render for authenticated users
export default withAuthUser({
    whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
    whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
})(Event)