<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\About;
use App\Banner;
use App\Category;
use App\SubCategory;
use App\News;
use App\User;
class PagesController extends Controller
{   
    function __construct()
    {   
        $banner = Banner::all();
        $category = Category::all();
        $subcategory = SubCategory::all();
        $about = About::find(1);
        $baivietmoinhat = News::get()->where('Type',1)->where('Active',1)->sortByDesc('created_at')->take(4);
        $baivietnoibat = News::get()->where('Type',1)->where('Index',1)->where('Active',1)->sortByDesc('created_at')->take(4);
        view()->share('baivietnoibat',$baivietnoibat);
        view()->share('baivietmoinhat',$baivietmoinhat);
        view()->share('banner',$banner);
        view()->share('category',$category);
        view()->share('subcategory',$subcategory);
        view()->share('about',$about);
    }
    public function trangchu()
    {
        $videomoinhat = News::get()->where('Type',0)->where('Active',1)->sortByDesc('created_at')->take(4);
        $videonoibat = News::get()->where('Type',0)->where('Index',1)->where('Active',1)->sortByDesc('created_at')->take(4);

        $name = "Trang chủ";
        return view('pages.trangchu',['name'=>$name,'videomoinhat'=>$videomoinhat,'videonoibat'=>$videonoibat]);
    }
    public function blog()
    {   
        $news = News::where('Type',1)->where('Active',1)->orderby('created_at','DESC')->paginate(5);
        $name = "Blog";
        return view('pages.blog',['name'=>$name,'news'=>$news]);
    }
    public function video()
    {   
        $news = News::where('Type',0)->where('Active',1)->orderby('created_at','DESC')->paginate(5);
        $name = "Video";
        return view('pages.blog',['name'=>$name,'news'=>$news]);
    }
    public function detailsNews($id)
    {
        $news = News::find($id);
        if ($news->Type==1){
            $name = "Tin tức";
        }
        else {
            $name = "Video";
        }
        // $_SESSION['view'] ='news/'.$id.'_'.$news->Sort_Title;
      
        $title = $news->Title;
        $tinlienquan = News::where('idSubcategory',$news->idSubcategory)->take(4)->get();
        return view('pages.details',['news'=>$news,'name'=>$name,'title'=>$title,'tinlienquan'=>$tinlienquan]);
    }
    public function getLogin()
    {
        return view('pages.login');
    }
    public function postLogin(Request $request)
    {
        $this->validate($request,[

            'username'=>'required',
            'password'=>'required|min:6|max:32',
        ],[
            'username.required'=>'Chưa nhập tài khoản',
            'password.required'=>'Chưa nhập password',
            'password.min'=>'từ 6-32 kí tự',
            'password.max'=>'từ 6-32 kí tự',
        ]);
        if (Auth::attempt(['email'=>$request->username,'password'=>$request->password])||Auth::attempt(['username'=>$request->username,'password'=>$request->password]))
        {
            // if(isset($_SESSION['view'])){
            //     return redirect($_SESSION['view']);
            // }
            return redirect('/');
        }
        else 
        {
            return redirect('/login')->with('thongbao','đăng nhập không thành công');
        }
    }
    public function getSignup()
    {
        return view('pages.signup');
    }
    public function postSignup(Request $request)
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
        $user->Role = 0;
        $user->Image = "avatar.jpg";
        $user->Active = 1;
        $user->save();
        return redirect('/login')->with('thongbao','đăng kí thành công');
    }
    public function getLogout(){
        Auth::logout();
        return redirect('/');
    }
    public function userDetails()
    {
        if (Auth::check()){
            $user = Auth::user();
        }
        else{
            return redirect('/login');

        }
        
        // $user = User::find($id);
        $name = "Trang cá nhân";
        return view('pages.user',['user'=>$user,'name'=>$name]);
    }
    public function getEditImg()
    {
        return view('pages.user.editimg',['name'=>'Sửa ảnh']);
    }
    public function postEditImg(Request $request)
    {
        $user = User::find(Auth::user()->id);
        if ($request->hasFile('Image'))
        {
            $file = $request->file('Image');
            $format = $file->getClientOriginalExtension();
            if($format != 'jpg' && $format != 'png' && $format != 'jpeg')
            {
                return redirect('/editimg.html')->with('thongbao','Không hỗ trợ'.$format);
            }
            $name = $file->getClientOriginalName();
            $img =str_random(4)."-".$name;
            while (file_exists("upload/avatar/".$img)){
                $img =str_random(4)."-".$name;
            }
            $file->move("upload/avatar",$img);
            if ($user->Image!=""){
                if ($user->Image!="avatar.jpg"){
            unlink("upload/avatar/".$user->Image);

                    }
            }
            $user->Image = $img;
        }
        $user->save();
        return redirect('/trangcanhan')->with('thongbao','Bạn đã sửa thành công');
    }
    public function search(Request $request){
        $keyword = $request->KeyWord;
        $news = News::where('Title','like',"%$keyword%")->Where('Active',1)->orWhere('Summary','like',"%$keyword%")->orWhere('Content','like',"%$keyword%")->take(10)->paginate(5);
        return view('pages.search',['name'=>'Tìm kiếm','news'=>$news,'keyword'=>$keyword]);
    }
    public function subcategory($id)
    {
        $subcategory = SubCategory::find($id);
        $news = News::where('idSubcategory',$id)->paginate(5);
        return view('pages.subcategory',['name'=>$subcategory->Name,'title'=>$subcategory->Name,'news'=>$news]);
    }
    public function category($id)
    {
        $category = Category::find($id);
        $news = News::where('idCategory',$id)->paginate(5);
        return view('pages.category',['name'=>$category->Name,'title'=>$category->Name,'news'=>$news]);
    }
}
