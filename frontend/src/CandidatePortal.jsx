import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle } from 'lucide-react';

export default function CandidatePortal() {
    const [email, setEmail] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    const validate = (m) => /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.com$/.test(m);

    useEffect(() => {
        if (statusData?.status === 'ACTIVE' && !statusData.acknowledged && statusData.promoted_at) {
            const timer = setInterval(() => {
                const deadline = new Date(statusData.promoted_at).getTime() + (24 * 60 * 60 * 1000);
                const now = new Date().getTime();
                const distance = deadline - now;

                if (distance <= 0) {
                    setTimeLeft("Expired");
                    setIsExpired(true);
                    clearInterval(timer);
                    checkStatus(); 
                } else {
                    setIsExpired(false);
                    const h = Math.floor(distance / (1000 * 60 * 60));
                    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((distance % (1000 * 60)) / 1000);
                    setTimeLeft(`${h}h ${m}m ${s}s`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [statusData]);

    const checkStatus = async () => {
        if (!validate(email)) return alert("Invalid Email: Must start with letter and end with .com");
        try {
            const res = await axios.get(`http://localhost:5000/api/status/${email}`);
            setStatusData(res.data);
        } catch { alert("Candidate not found"); }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
            <h1 style={{color: '#4834d4', textAlign: 'center'}}>Job Application</h1>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h3>Apply Now</h3>
                <input style={{width: '96%', padding: '10px', marginBottom: '10px'}} placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input style={{width: '96%', padding: '10px', marginBottom: '10px'}} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                <button style={{width: '100%', padding: '10px', background: '#4834d4', color: '#fff', border: 'none', cursor: 'pointer'}} onClick={async () => {
                    if(!validate(form.email)) return alert("Email must start with a letter and end in .com");
                    await axios.post('http://localhost:5000/api/apply', form);
                    alert("Applied Successfully!");
                }}>Submit Application</button>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ddd' }}>
                <h3>Check Status</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input style={{flex: 1, padding: '10px'}} placeholder="Enter Email" onChange={e => setEmail(e.target.value)} />
                    <button style={{padding: '10px'}} onClick={checkStatus}>Check</button>
                </div>
                {statusData && (
                    <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        <p>Status: <b style={{color: statusData.status === 'ACTIVE' ? 'green' : 'orange'}}>{statusData.status}</b></p>
                        {statusData.status === 'WAITLISTED' && <p>Queue Position: <b>{statusData.queue_position}</b></p>}
                        {statusData.status === 'ACTIVE' && !statusData.acknowledged && (
                            <div style={{background: '#fff3cd', padding: '15px', borderRadius: '5px'}}>
                                <p style={{fontWeight: 'bold'}}><Clock size={16} style={{verticalAlign:'middle'}}/> Time to Acknowledge: {timeLeft}</p>
                                {!isExpired && <button style={{background: 'green', color: '#fff', padding: '12px', width: '100%', border: 'none', borderRadius: '5px'}} onClick={async () => {
                                    await axios.post(`http://localhost:5000/api/applicants/${statusData.id}/acknowledge`);
                                    alert("Spot Confirmed!");
                                    checkStatus();
                                }}>CONFIRM MY SPOT</button>}
                            </div>
                        )}
                        {statusData.acknowledged && <p style={{color: 'green', fontWeight: 'bold'}}>✅ You have confirmed your spot!</p>}
                    </div>
                )}
            </div>
        </div>
    );
}