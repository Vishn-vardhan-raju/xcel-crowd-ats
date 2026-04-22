import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, Search, CheckCircle, Clock } from 'lucide-react';

export default function CandidatePortal() {
    const [email, setEmail] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [form, setForm] = useState({ name: '', email: '' });

    const apply = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/apply', { ...form, jobId: 6 });
            alert("Success! Check your status below.");
            setForm({ name: '', email: '' });
        } catch (err) { alert("Error applying. Is the server running?"); }
    };

    const checkStatus = async () => {
        const res = await axios.get(`http://localhost:5000/api/status/${email}`);
        setStatusData(res.data);
    };

    const acknowledge = async () => {
        try {
            const res = await axios.post(`http://localhost:5000/api/applicants/${statusData.id}/acknowledge`);
            if(res.data.success) {
                alert("Confirmed!");
                checkStatus();
            }
        } catch (err) { alert("Error acknowledging."); }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{color: '#4834d4', textAlign: 'center'}}>Job Application</h1>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h3><UserPlus size={18}/> Apply Now</h3>
                <form onSubmit={apply} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input style={{padding: '10px'}} placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    <input style={{padding: '10px'}} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                    <button style={{padding: '10px', background: '#4834d4', color: '#fff', cursor: 'pointer', border: 'none'}} type="submit">Submit</button>
                </form>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <h3><Search size={18}/> Check Status</h3>
                <div style={{display: 'flex', gap: '10px'}}>
                    <input style={{flex: 1, padding: '10px'}} placeholder="Enter Email" onChange={e => setEmail(e.target.value)} />
                    <button onClick={checkStatus}>Check</button>
                </div>
                {statusData && (
                    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee' }}>
                        <p>Status: <b style={{color: statusData.status === 'ACTIVE' ? 'green' : 'orange'}}>{statusData.status}</b></p>
                        {statusData.status === 'WAITLISTED' && <p><Clock size={14}/> Queue Position: #{statusData.queue_position}</p>}
                        {statusData.status === 'ACTIVE' && !statusData.acknowledged && (
                            <button onClick={acknowledge} style={{ width: '100%', padding: '10px', background: '#2ecc71', color: '#fff', border: 'none', fontWeight: 'bold' }}>CONFIRM MY SPOT</button>
                        )}
                        {statusData.acknowledged && <p style={{color: 'green'}}>✅ Spot Confirmed</p>}
                    </div>
                )}
            </div>
        </div>
    );
}