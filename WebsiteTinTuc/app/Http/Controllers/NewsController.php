<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Category;
use App\SubCategory;
use App\News;
use Illuminate\Support\Facades\Redirect;

class NewsController extends Controller
{
    public function list()
    {
        $news = News::all();
        return view('admin.news.list',['news'=>$news]);
    }
    public function getCreate()
    {
        $category = Category::all();
        $subcategory = SubCategory::all();
        return view('admin.news.create',['category'=>$category,'subcategory'=>$subcategory]);
    }
    public function postCreate(Request $request)
    {
        $this->validate($request,[
            'SubCategory'=>'required',
            'Title'=>'required|min:1',
            'Summary'=>'required|min:1',
            'Content'=>'required|min:1',

        ],[
            'SubCategory.required'=>'Vui lòng chọn',
            'Title.required'=>'Vui lòng nhập',
            'Title.min'=>'Tên chứa ít nhất 1 kí tự',
            'Summary.required'=>'Vui lòng nhập',
            'Summary.min'=>'Chứa ít nhất 1 kí tự',
            'Content.required'=>'Vui lòng nhập',
            'Content.min'=>'Chứa ít nhất 1 kí tự',

        ]);
        $news = new News();
        $news->Title = $request->Title;
        $news->Sort_Title = changeTitle($request->Title);
        $news->Type = $request->Type;
        $news->Summary = $request->Summary;
        $news->Content = $request->Content;
        $news->Index = $request->Index;
        if ( $request->Type==0){
            $news->Link = $request->Link;
        }
        $news->idUser = $request->iduser;
        $news->Active = $request->Active;
        $news->created_at = now();
        $news->idCategory = $request->Category;
        $news->idSubcategory = $request->SubCategory;
        
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
            while (file_exists("upload/news/".$img)){
                $img =str_random(4)."-".$name;
            }
            $file->move("upload/news",$img);
            $news->Image = $img;

        }
        else {
            $news->Image = "";
        }
        $news->save();
        return redirect('admin/news/list')->with('thongbao','Bạn đã thêm thành công');
    }
    public function getEdit($id)
    {
        $category = Category::all();
        $subcategory = SubCategory::all();
        $news = News::find($id);
        return view('admin.news.edit',['category'=>$category,'subcategory'=>$subcategory,'news'=>$news]);
    }
    public function postEdit(Request $request ,$id)
    {
        $news = News::find($id);
        $this->validate($request,[
            'SubCategory'=>'required',
            'Title'=>'required|min:1',
            'Summary'=>'required|min:1',
            'Content'=>'required|min:1',

        ],[
            'SubCategory.required'=>'Vui lòng chọn',
            'Title.required'=>'Vui lòng nhập',
            'Title.min'=>'Tên chứa ít nhất 1 kí tự',
            'Summary.required'=>'Vui lòng nhập',
            'Summary.min'=>'Chứa ít nhất 1 kí tự',
            'Content.required'=>'Vui lòng nhập',
            'Content.min'=>'Chứa ít nhất 1 kí tự',

        ]);
        $news->Title = $request->Title;
        $news->Sort_Title = changeTitle($request->Title);
        $news->Type = $request->Type;
        if ( $request->Type==0){
            if ($request->Link!=""){
            $news->Link = $request->Link;
            }
        }
        $news->Summary = $request->Summary;
        $news->Content = $request->Content;
        $news->Index = $request->Index;
        $news->Active = $request->Active;
        $news->updated_at = now();
        $news->idCategory = $request->Category;
        $news->idSubcategory = $request->SubCategory;
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
            while (file_exists("upload/news/".$img)){
                $img =str_random(4)."-".$name;
            }
            $file->move("upload/news",$img);
            if ($news->Image!=""){
            unlink("upload/news/".$news->Image);
            }
            $news->Image = $img;

        }
        $news->save();
        return redirect('admin/news/list')->with('thongbao','Bạn đã sửa thành công');

    }
    public function postActive($id)
    {
        $news = News::find($id);
        $news->Active =1;
        $news->save();
        return redirect('admin/news/list')->with('thongbao','Update thành công');
    }
    public function postNoActive($id)
    {
        $news = News::find($id);
        $news->Active =0;
        $news->save();
        return redirect('admin/news/list')->with('thongbao','Update thành công');
    }
}
