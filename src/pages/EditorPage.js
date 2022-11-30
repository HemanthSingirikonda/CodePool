import React, { useState, useRef, useEffect } from 'react';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EditorPage = () => {
	const reactNavigator = useNavigate();
	const location = useLocation();
	const socketRef = useRef(null);
	const codeRef = useRef(null);
	const { roomId } = useParams();

	const [clients, setClients] = useState([]);

	useEffect(() => {
		async function init() {
			socketRef.current = await initSocket();
			socketRef.current.on('connect_error', (err) => handleErrors(err));
			socketRef.current.on('connect_failed', (err) => handleErrors(err));

			function handleErrors(e) {
				console.log('Socket Error', e);
				toast.error('Socket Connection Failed, Try Again Later !');
				reactNavigator('/');
			}

			socketRef.current.emit(ACTIONS.JOIN, {
				roomId,
				username: location.state?.username,
			});

			// Listening for Joined Event
			socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
				if (username !== location.state?.username) {
					toast.success(`${username} joined the Room`);
				}

				setClients(clients);

				// SYNC_CODE for New Client Joined
				socketRef.current.emit(ACTIONS.SYNC_CODE, { socketId, code: codeRef.current });
			});

			// Listening for Disconnected
			socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
				toast.success(`${username} left the Room`);
				setClients((prevClients) => {
					return prevClients.filter((client) => client.socketId !== socketId);
				});
			});
		}

		init();
		return () => {
			socketRef.current.disconnect();
			socketRef.current.off(ACTIONS.JOINED);
			socketRef.current.off(ACTIONS.DISCONNECTED);
		};
	}, []);

	if (!location.state) {
		return <Navigate to='/' />;
	}

	const copyRoomId = async () => {
		try {
			await navigator.clipboard.writeText(roomId);
			toast.success('Room ID Copied to Clipboard');
		} catch (err) {
			console.log(err);
			toast.error('Sorry, Some Error Occured :( Could Not Copy Room ID');
		}
	};

	const leaveRoom = () => {
		reactNavigator('/');
	};

	return (
		<div className='mainWrap'>
			<div className='aside'>
				<div className='asideInner'>
					<div className='logo'>
						<img className='logoImage' src='/logo.png' alt='logo' />
					</div>
					<h3>Connected</h3>
					<div className='clientsList'>
						{clients.map((client) => (
							<Client key={client.socketId} username={client.username} />
						))}
					</div>
				</div>
				<button className='btn copyBtn' onClick={copyRoomId}>
					COPY ROOM ID
				</button>
				<button className='btn leaveBtn' onClick={leaveRoom}>
					Leave
				</button>
			</div>
			<div className='editorWrap'>
				<Editor
					socketRef={socketRef}
					roomId={roomId}
					onCodeChange={(code) => {
						codeRef.current = code;
					}}
				/>
			</div>
		</div>
	);
};

export default EditorPage;
