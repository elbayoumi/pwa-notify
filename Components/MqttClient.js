// components/MqttClient.js
import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MqttClient = () => {
    const [client, setClient] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Define connection options for MQTT client
        const options = {
            host: process.env.NEXT_PUBLIC_HOST,
            port: parseInt(process.env.NEXT_PUBLIC_PORT, 10),
            protocol: process.env.NEXT_PUBLIC_PROTOCOL,
            username: process.env.NEXT_PUBLIC_USERNAME,
            password: process.env.NEXT_PUBLIC_PASSWORD,
        };

        // Create and connect the MQTT client
        const mqttClient = mqtt.connect(options);
        setClient(mqttClient);

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            mqttClient.subscribe('test1/topic', (err) => {
                if (!err) {
                    console.log('Subscribed to topic: test1/topic');
                }
            });
        });

        mqttClient.on('message', (topic, message) => {
            const msg = message.toString();
            displayNotification(msg);
            console.log(`Received message from ${topic}: ${msg}`);
            setMessages((prev) => [...prev, { topic, message: msg }]);
        });

        mqttClient.on('error', (error) => {
            console.error('Connection error:', error);
        });

        // Clean up on component unmount
        return () => mqttClient.end();
    }, []);

    // Send message function
    const sendMessage = () => {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (message && client) {
            client.publish('test1/topic', message);
            input.value = '';
        }
    };

    // Display notification with sound
    const displayNotification = (msg) => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/333/333-preview.mp3');
        audio.play().catch((error) => console.error('Error playing audio:', error));

        if (Notification.permission === 'granted') {
            const notification = new Notification('Dashboard MQTT Message', {
                body: msg,
                icon: 'https://stage.busatyapp.com/uploads/staffs_logo/f8Y74rX3oyXUXNwcdk7gaPq9FgF2d9lAC9rYd026.jpg',
            });
            notification.onclick = () => window.open('https://stage.busatyapp.com/dashboard/coupon', '_self');
        }
    };

    // Request notification permission on page load
    useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then((permission) => {
                console.log(`Notifications permission: ${permission}`);
            });
        }
    }, []);

    return (
        <div>
            <div className="content-body">
                <ul id="messages">
                    {messages.map((msg, index) => (
                        <li key={index}>Topic: {msg.topic}, Message: {msg.message}</li>
                    ))}
                </ul>
                <input
    id="messageInput"
    type="text"
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }}
    placeholder="Enter message"
/>

                <button id="sendButton" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default MqttClient;
