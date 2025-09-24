<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\About;
class AboutController extends Controller
{
    public function getEdit()
    {
        $about = About::find(1);
        return view('admin.about.details',['about'=>$about]);
    }
    public function postEdit(Request $request)
    {
        $about = About::find(1);
        if ($about==null){
            $about = new About();
        }
        // $about->logo = $request->logo;
        $about->phone = $request->phone;
        $about->email = $request->email;
        $about->address = $request->address;
        $about->linkfb = $request->linkpage;
        $about->copyright = $request->copyright;
        $about->linkcopyright = $request->link;
        if ($request->hasFile('Image'))
        {
            $file = $request->file('Image');
            $format = $file->getClientOriginalExtension();
            if($format != 'jpg' && $format != 'png' && $format != 'jpeg')
            {
                return redirect('about')->with('thongbao','Không hỗ trợ'.$format);
            }
            $name = $file->getClientOriginalName();
           
            $file->move("upload/logo",$name);
            if ($about->logo!=""){
            unlink("upload/logo/".$about->logo);
            }
            $about->logo = $name;
        }
        $about->save();
        return redirect('admin/about')->with('thongbao','Thành công');

       
    }
}
