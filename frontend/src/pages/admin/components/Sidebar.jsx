import { Drawer, List, ListItemButton, ListItemText, Toolbar } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const adminMenu = [
  { label: 'Dashboard', path: '/admin/dashboard' },
  { label: 'Manage Users', path: '/admin/users' },
  { label: 'Manage Books', path: '/admin/books' },
  { label: 'Owner Uploads', path: '/admin/owner-uploads' },
]

export default function AdminSidebar() {
  const navigate = useNavigate()

  return (
    <Drawer variant="permanent" sx={{ width: 200, flexShrink: 0 }}>
      <Toolbar />
      <List>
        {adminMenu.map((item) => (
          <ListItemButton key={item.path} onClick={() => navigate(item.path)}>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  )
}
