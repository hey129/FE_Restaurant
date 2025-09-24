<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Banner;
class BannerController extends Controller
{
    public function list()
    {
        $banner = Banner::all();
        return view('admin.banner.list',['banner'=>$banner]);
    }
    public function getCreate()
    {
        return view('admin.banner.create');
    }
    public function postCreate(Request $request)
    {
        $this->validate($request,[
            
            'Name'=>'required|min:1',
            'Content'=>'required|min:1',
            'Link'=>'required|min:1',
        ],[
            
            'Name.required'=>'Vui lòng nhập',
            'Name.min'=>'Tên chứa ít nhất 1 kí tự',

        ]);
        $banner = new Banner();
        $banner->Name = $request->Name;
        $banner->Content = $request->Content;
        $banner->Link = $request->Link;
        $banner->Active = $request->Active;
        $banner->created_at = now();
        if ($request->hasFile('Image'))
        {
            $file = $request->file('Image');
            $format = $file->getClientOriginalExtension();
            if($format != 'jpg' && $format != 'png' && $format != 'jpeg')
            {
                return redirect('news/create')->with('thongbao','Không hỗ trợ'.$format);
            }
            $name = $file->getClientOriginalName();
            $img =str_random(4)."-".$name;
            while (file_exists("upload/banner/".$img)){
                $img =str_random(4)."-".$name;
            }
            $file->move("upload/banner",$img);
            $banner->Image = $img;

        }
        else {
            $banner->Image = "";
        }
        $banner->save();
        return redirect('admin/banner/list')->with('thongbao','Bạn đã thêm thành công');
    }
    public function getEdit($id)
    {
        $banner = Banner::find($id);
        return view('admin.banner.edit',['banner'=>$banner]);
    }
    public function postEdit(Request $request ,$id)
    {
        $banner = Banner::find($id);
        $this->validate($request,[
            
            'Name'=>'required|min:1',
            'Content'=>'required|min:1',
            'Link'=>'required|min:1',
        ],[
            
            'Name.required'=>'Vui lòng nhập',
            'Name.min'=>'Tên chứa ít nhất 1 kí tự',

        ]);
        $banner->Name = $request->Name;
        $banner->Content = $request->Content;
        $banner->Link = $request->Link;
        $banner->Active = $request->Active;
        $banner->updated_at = now();
        if ($request->hasFile('Image'))
        {
            $file = $request->file('Image');
            $format = $file->getClientOriginalExtension();
            if($format != 'jpg' && $format != 'png' && $format != 'jpeg')
            {
                return redirect('news/create')->with('thongbao','Không hỗ trợ'.$format);
            }
            $name = $file->getClientOriginalName();
            $img =str_random(4)."-".$name;
            while (file_exists("upload/banner/".$img)){
                $img =str_random(4)."-".$name;
            }
            $file->move("upload/banner",$img);
            if ($banner->Image!=""){
            unlink("upload/banner/".$banner->Image);
            }
            $banner->Image = $img;

        }
        $banner->save();
        return redirect('admin/banner/list')->with('thongbao','Bạn đã sửa thành công');

    }
    public function postActive($id)
    {
        $banner = Banner::find($id);
        $banner->Active =1;
        $banner->save();
        return redirect('admin/banner/list')->with('thongbao','Update thành công');
    }
    public function postNoActive($id)
    {
        $banner = Banner::find($id);
        $banner->Active =0;
        $banner->save();
        return redirect('admin/banner/list')->with('thongbao','Update thành công');
    }
}
