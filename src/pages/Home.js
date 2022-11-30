import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Footer from '../util/Footer';

const Home = () => {
	const navigate = useNavigate();

	const [roomId, setRoomId] = useState('');
	const [username, setUsername] = useState('');
	const createNewRoom = (e) => {
		e.preventDefault();
		const id = uuidv4();
		console.log(id);
		setRoomId(id);
		toast.success('Created New Room');
	};

	const joinRoom = () => {
		if (!roomId || !username) {
			toast.error('ROOM ID and Username is required');
			return;
		}
		// Redirect
		navigate(`/editor/${roomId}`, { state: { username } });
	};

	const handleInputEnter = (e) => {
		if (e.code === 'Enter') {
			joinRoom();
		}
	};

	return (
		<>
		<div className='homepage'>
			<div className='container'>
				<img className='homepagelogo' src='/logo.png' alt='logo' />
				<h4 className='mainlabel'>Paste Invitation ROOM ID</h4>
				<div className='inputGroup'>
					<input type='text' className='inputBox' placeholder='ROOM ID' value={roomId} onKeyUp={handleInputEnter} onChange={(e) => setRoomId(e.target.value)} />
					<input type='text' className='inputBox' placeholder='USERNAME' value={username} onKeyUp={handleInputEnter} onChange={(e) => setUsername(e.target.value)} />
					<button className='btn joinBtn' onClick={joinRoom}>
						Join
					</button>
					<span className='createInfo'>
						If You don't have invite then create &nbsp;
						<a href='' onClick={createNewRoom} className='createNewBtn'>
							New Room
						</a>
					</span>
				</div>
			</div>
			<Footer />
		</div>
		</>
	);
};

export default Home;
