<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Category;

class CategoryController extends Controller
{
    public function list()
    {
        $category = Category::all();

        return view('admin.category.list',['category'=>$category]);
    }
    public function getCreate()
    {
        return view('admin.category.create');
    }
    public function postCreate(Request $request)
    {
            $this->validate($request,[
                'Name'=>'required|unique:Category|min:3'
            ],[
                'Name.required'=>'Vui lòng nhập tên',
                'Name.unique'=>'Tên đã tồn tại',
                'Name.min'=>'Số kí tự phải từ 3 trở lên'
            ]);
            $category = new Category();
            $category->Name = $request->Name;
            $category->Sort_Name =changeTitle($request->Name);
            $category->save();
            return redirect('admin/category/list')->with('thongbao','Thêm thành công');

    }
    public function getEdit($id)
    {
        $category = Category::find($id);
        return view('admin.category.edit',['category'=>$category]);
    }
    public function postEdit(Request $request, $id){
        $category = Category::find($id);
        $this->validate($request,[
            'Name'=>'required|unique:Category|min:3'
        ],[
            'Name.required'=>'Vui lòng nhập tên',
            'Name.unique'=>'Tên tồn tại',
            'Name.min'=>'Tên phải lớn hơn 3 kí tự'
        ]);
        $category->Name = $request->Name;
        $category->Sort_Name =changeTitle($request->Name);
        $category->save();
        return redirect('admin/category/list')->with('thongbao','Sửa thành công');
    }
    public function postActive($id)
    {
        $category = Category::find($id);
        $category->Active =1;
        $category->save();
        return redirect('admin/category/list')->with('thongbao','Update thành công');
    }
    public function postNoActive($id)
    {
        $category = Category::find($id);
        $category->Active =0;
        $category->save();
        return redirect('admin/category/list')->with('thongbao','Update thành công');
    }
}
