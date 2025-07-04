import {Drawer, List, ListItemButton, ListItemText, Toolbar} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
const menuItems = [
  {text: 'Dashboard', path: '/dashboard'}, 
  {text: 'Settings', path: '/settings'},
  {text: 'Profile', path: '/profile'},
  {text: 'Help', path: '/help'},
];
const Sidebar = () => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    
    const handleNavigation = (path) => {
        navigate(path);
    };
    
    return (
        <Drawer variant="permanent" anchor="left">
        <Toolbar />
        <List>
            {menuItems.map((item) => (
            <ListItemButton key={item.text} onClick={() => handleNavigation(item.path)}>
                <ListItemText primary={t(item.text)} />
            </ListItemButton>
            ))}
        </List>
        </Drawer>
    );
    }
export default Sidebar;