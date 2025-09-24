@extends('admin.layout.index')
@section('content')
<div class="page-header card">
    <div class="row align-items-end">
        <div class="col-lg-8">
            <div class="page-header-title">
                <i class="feather icon-home bg-c-blue"></i>
                <div class="d-inline">
                    <h4>Sub Category</h4>
                    <span>Edit</span>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="page-header-breadcrumb">
                <ul class=" breadcrumb breadcrumb-title">
                    <li class="breadcrumb-item">
                        <a href=""><i class="feather icon-home"></i></a>
                    </li>
                    <li class="breadcrumb-item"><a href="#!">Loại tin</a> </li>
                </ul>
            </div>
        </div>
    </div>
</div>
<div class="main-body">
    <div class="page-wrapper">

        <div class="page-body">
            <div class="row">
                <div class="col-sm-12">

                    <div class="card">
                        <div class="card-header">
                            <h5>{{$subcategory->Name}}</h5>

                        </div>
                        <div class="card-block">
                            @if(count($errors)>0)
                            <div class="alert alert-danger">
                                @foreach($errors->all() as $arr)
                                {{$arr}}<br>
                                @endforeach

                            </div>
                            @endif
                            @if (session('thongbao'))
                            <div class="alert alert-success">
                                {{session('thongbao')}}
                            </div>
                            @endif
                            <form action="admin/subcategory/edit/{{$subcategory->id}}" method="POST">
                                <input type="hidden" name="_token" value="{{csrf_token()}}" />
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Thể loại</label>
                                    <div class="col-sm-11">
                                        <select name="Category" class="form-control form-control-primary">
                                            @foreach ($category as $tl)
                                            <option
                                            @if ($tl->id == $subcategory->idCategory)
                                                {{"selected"}}
                                            @endif
                                            value="{{$tl->id}}">{{$tl->Name}}</option>    
                                            @endforeach
                                        </select>
                                    </div>
                                   
                                    </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Tên</label>
                                    <div class="col-sm-11">
                                        <input type="text" class="form-control" value="{{$subcategory->Name}}" name="Name"
                                            placeholder="Nhập tên subcategory" required>
                                        <span class="messages"></span>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1"></label>
                                    <div class="col-sm-10">
                                        <button type="submit" class="btn btn-primary m-b-0">Cập nhật</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
@endsection
