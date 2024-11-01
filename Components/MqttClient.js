// components/MqttClient.js
import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const MqttClient = () => {
    const [client, setClient] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // إعداد الخيارات للاتصال
        const options = {
            host: process.env.NEXT_PUBLIC_HOST,
            port: process.env.NEXT_PUBLIC_PORT,
            protocol: process.env.NEXT_PUBLIC_PROTOCOL,
            username: process.env.NEXT_PUBLIC_USERNAME,
            password: process.env.NEXT_PUBLIC_PASSWORD,
        };

        // إنشاء العميل MQTT
        const mqttClient = mqtt.connect(options);
        setClient(mqttClient);

        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            mqttClient.subscribe('test/topic', (err) => {
                if (!err) {
                    console.log('Subscribed to topic: test/topic');
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

        // تنظيف الاتصال عند إلغاء المكون
        return () => mqttClient.end();
    }, []);

    // دالة لإرسال الرسالة
    const sendMessage = () => {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        if (message && client) {
            client.publish('test/topic', message);
            input.value = '';
        }
    };

    const displayNotification = (msg) => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/333/333-preview.mp3');
        audio.play().catch((error) => console.error('لم يتم تشغيل الصوت:', error));
        if (Notification.permission === 'granted') {
            const notification = new Notification('Dashboard MQTT Message', {
                body: msg,
                icon: 'https://stage.busatyapp.com/uploads/staffs_logo/f8Y74rX3oyXUXNwcdk7gaPq9FgF2d9lAC9rYd026.jpg',
            });
            notification.onclick = () => window.open('https://stage.busatyapp.com/dashboard/coupon', '_self');
        }
    };

    // طلب إذن الإشعارات عند تحميل الصفحة
    useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Notifications permission granted.');
                } else {
                    console.log('Notifications permission denied.');
                }
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
/>                <button id="sendButton" onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default MqttClient;
