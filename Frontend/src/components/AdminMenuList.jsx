import { Menu } from 'antd';
import {
    AppstoreAddOutlined,
    AreaChartOutlined,
    BarsOutlined, FileAddOutlined,
    HomeOutlined,
    PayCircleOutlined,
    SettingOutlined, UnorderedListOutlined,
    UserOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const AdminMenuList = ({ darkTheme }) => {
    const navigate = useNavigate();

    const handleMenuClick = (e) => {
        // Depending on the key of the menu item, navigate to the corresponding route
        switch (e.key) {
            case 'myCourses':
                navigate('/admin/courses');
                break;
            case 'addCourses':
                navigate('/admin/addcourse');
                break;
            case 'addCategory':
                navigate('/admin/addcategory');
                break;
            case 'userManagement':
                navigate('/admin/usermanagement');
                break;
            case 'lessons':
                navigate('/admin/lessons');
                break;
            case 'cancellationRequests':
                navigate('/admin/cancellation-requests');
                break;
            case 'progress':
                navigate('/admin/progress');
                break;
            case 'payment':
                navigate('/admin/payment');
                break;
            case 'setting':
                navigate('/admin/settings');
                break;
            default:
            // handle default case
        }
    };

    return (
        <Menu theme={darkTheme ? 'dark' : 'light'} mode='inline' className='menu-bar' onClick={handleMenuClick}>
            <Menu.Item key='myCourses' icon={<HomeOutlined />}>
                My Courses
            </Menu.Item>
            <Menu.Item key='addCourses' icon={<AppstoreAddOutlined />}>
                Add Courses
            </Menu.Item>
            <Menu.Item key='lessons' icon={<FileAddOutlined />}>
                Lessons
            </Menu.Item>
            <Menu.Item key='addCategory' icon={<UnorderedListOutlined />}>
                Categories
            </Menu.Item>
            <Menu.Item key='userManagement' icon={<UserOutlined />}>
                Users
            </Menu.Item>
            <Menu.Item key='cancellationRequests' icon={<UserOutlined />}>
                Requests
            </Menu.Item>
            {/*<Menu.SubMenu key='tasks' icon={<BarsOutlined />} title="Tasks">*/}
            {/*    <Menu.Item key='task-1'>Task 1</Menu.Item>*/}
            {/*    <Menu.Item key='task-2'>Task 2</Menu.Item>*/}
            {/*    <Menu.SubMenu key='subtasks' title="SubTasks">*/}
            {/*        <Menu.Item key='subtask-1'>SubTask 1</Menu.Item>*/}
            {/*        <Menu.Item key='subtask-2'>SubTask 2</Menu.Item>*/}
            {/*    </Menu.SubMenu>*/}
            {/*</Menu.SubMenu>*/}
            <Menu.Item key='progress' icon={<AreaChartOutlined />}>
                Progress
            </Menu.Item>
            <Menu.Item key='payment' icon={<PayCircleOutlined />}>
                Payment
            </Menu.Item>
            <Menu.Item key='setting' icon={<SettingOutlined />}>
                Setting
            </Menu.Item>
        </Menu>
    );
};

export default AdminMenuList;
