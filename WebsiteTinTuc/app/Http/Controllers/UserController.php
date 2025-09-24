<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\User;

class UserController extends Controller
{
    public function list()
    {
        $user = User::all();
        return view('admin.user.list',['user'=>$user]);
    }
    public function getCreate()
    {
        return view('admin.user.create');
    }
    public function postCreate(Request $request)
    {
        $this->validate($request,[
            'name'=>'required|min:1',
            'email'=>'required|unique:users,email',
            'username'=>'required|min:1|max:255|unique:users,username',
            'password'=>'required|min:6|max:32',
            'passwordagain'=>'required|same:password',
        ],[
            'name.required'=>'Nhập tên',
            'name.min'=>'Tên ít nhất 1 kí tự',
            'email.required'=>'Nhập email',
            'email.unique'=>'email đã tồn tại',
            'username.required'=>'Nhập username',
            'username.min'=>'username hợp lệ từ 1-255 kí tự',
            'username.max'=>'username hợp lệ từ 1-255 kí tự',
            'username.unique'=>'username đã tồn tại',
            'password.required'=>'Vui lòng nhập mật khẩu',
            'password.min'=>'Mật khẩu hợp lệ từ 6-32 kí tự',
            'password.max'=>'Mật khẩu hợp lệ từ 6-32 kí tự',
            'passwordagain.required'=>'Vui lòng nhập lại mật khẩu',
            'passwordagain.same'=>'Mật khẩu không trùng nhau'
        ]);
        $user = new User();
        $user->name = $request->name;
        $user->email= $request->email;
        $user->username = $request->username;
        $user->password = bcrypt($request->password);
        $user->Role = $request->role;
        $user->Image = "avatar.jpg";
        $user->Active = $request->active;
        $user->save();
        return redirect('admin/user/list')->with('thongbao','thêm thành công');
    }
    public function getEdit($id)
    {
        $user = User::find($id);
        return view('admin.user.edit',['user'=>$user]);
    }
    public function postEdit(Request $request,$id)
    {
        $user = User::find($id);
        
        $this->validate($request,[
            'name'=>'required|min:1',
            'email'=>'required|unique:users,email',
            'username'=>'required|min:1|max:255|unique:users,username',
        ],[
            'name.required'=>'Nhập tên',
            'name.min'=>'Tên ít nhất 1 kí tự',
            'email.required'=>'Nhập email',
            'email.unique'=>'email đã tồn tại',
            'username.required'=>'Nhập username',
            'username.min'=>'username hợp lệ từ 1-255 kí tự',
            'username.max'=>'username hợp lệ từ 1-255 kí tự',
            'username.unique'=>'username đã tồn tại',
        ]);
        
        
            $user->name = $request->name;
            $user->email = $request->email;
            $user->username = $request->username;

        if ($request->changepassword=="on")
        {
            $this->validate($request,[
                'password'=>'required|min:6|max:32',
                'passwordagain'=>'required|same:password',
            ],[
                'password.required'=>'Vui lòng nhập mật khẩu',
                'password.min'=>'Mật khẩu hợp lệ từ 6-32 kí tự',
                'password.max'=>'Mật khẩu hợp lệ từ 6-32 kí tự',
                'passwordagain.required'=>'Vui lòng nhập lại mật khẩu',
                'passwordagain.same'=>'Mật khẩu không trùng nhau'
            ]);
            $user->password= bcrypt($request->password);
        }
        $user->save();
        return redirect('admin/user/list')->with('thongbao','Sửa thành công');
    }
    public function getLogin()
    {
        return view('admin.login');
    }
    public function postLogin(Request $request)
    {
        $this->validate($request,[

            'username'=>'required',
            'password'=>'required',
        ],[
            'username.required'=>'Chưa nhập tài khoản',
            'password.required'=>'Chưa nhập password',
           
        ]);
        if (Auth::attempt(['email'=>$request->username,'password'=>$request->password]))
        {
            return redirect('admin/user/list');
        }
        else 
        {
            return redirect('admin/login')->with('thongbao','đăng nhập không thành công');
        }
    }
    public  function getdangxuatadmin()
    {
        Auth::logout();
        return redirect('admin/login');
    }
    public function postActive($id)
    {
        $user = User::find($id);
        $user->Active =1;
        $user->save();
        return redirect('admin/user/list')->with('thongbao','Update thành công');
    }
    public function postNoActive($id)
    {
        $user = User::find($id);
        $user->Active =0;
        $user->save();
        return redirect('admin/user/list')->with('thongbao','Update thành công');
    }
}
