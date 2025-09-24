<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Category;
use App\SubCategory;

class SubCategoryController extends Controller
{
    public function list()
    {
        $subcategory = SubCategory::all();
        return view('admin.subcategory.list',['subcategory'=>$subcategory]);
    }
    public function getCreate(){
        $category = Category::all();
        return view('admin.subcategory.create',['category'=>$category]);
    }
    public function postCreate(Request $request)
    {
        $this->validate($request,[
            'Category'=>'required',
            'Name'=>'required|unique:SubCategory|min:1'
        ],[
            'Category.required'=>'Vui lòng chọn Category',
            'Name.required'=>'Vui lòng nhập tên',
            'Name.unique'=>'Name đã tồn tại',
            'Name.min'=>'Name phải chứa ít nhất 1 kí tự'
        ]);
        $subcategory = new SubCategory();
        $subcategory->Name = $request->Name;
        $subcategory->idCategory= $request->Category;
        $subcategory->Sort_Name = changeTitle($request->Name);
        $subcategory->save();
        return redirect('admin/subcategory/list')->with('thongbao','Thêm thành công');
    }
    public function getEdit($id)
    {
        $subcategory = SubCategory::find($id);
        $category = Category::all();
        return view('admin.subcategory.edit',['subcategory'=>$subcategory,'category'=>$category]);
    }
    public function postEdit(Request $request, $id)
    {
        $subcategory = SubCategory::find($id);
        $this->validate($request,[
            'Category'=>'required',
            'Name'=>'required|min:1'
        ],[
            'Category.required'=>'Vui lòng chọn Category',
            'Name.required'=>'Vui lòng nhập tên',
            'Name.min'=>'Name phải chứa ít nhất 1 kí tự'
        ]);
        $subcategory->Name = $request->Name;
        $subcategory->idCategory = $request->Category;
        $subcategory->Sort_Name = changeTitle($request->Name);
        $subcategory->save();
        return redirect('admin/subcategory/edit/'.$id)->with('thongbao','Sửa thành công');
    }
    public function postActive($id)
    {
        $subcategory = SubCategory::find($id);
        $subcategory->Active =1;
        $subcategory->save();
        return redirect('admin/subcategory/list')->with('thongbao','Update thành công');
    }
    public function postNoActive($id)
    {
        $subcategory = SubCategory::find($id);
        $subcategory->Active =0;
        $subcategory->save();
        return redirect('admin/subcategory/list')->with('thongbao','Update thành công');
    }
}
