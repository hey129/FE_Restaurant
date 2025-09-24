@extends('admin.layout.index')
@section('content') 
<div class="page-header card">
    <div class="row align-items-end">
        <div class="col-lg-8">
            <div class="page-header-title">
                <i class="feather icon-home bg-c-blue"></i>
                <div class="d-inline">
                    <h4>News</h4>
                    <span>Create</span>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="page-header-breadcrumb">
                <ul class=" breadcrumb breadcrumb-title">
                    <li class="breadcrumb-item">
                        <a href=""><i class="feather icon-home"></i></a>
                    </li>
                    <li class="breadcrumb-item"><a href="#!">Tin tức</a> </li>
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
                            <h5>Thêm tin tức</h5>
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
                            <form action="admin/news/create" method="POST" enctype="multipart/form-data">
                                <input type="hidden" name="_token" value="{{csrf_token()}}" />
                                <input type="hidden" name="iduser" value="{{Auth::user()->id}}" />
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Category</label>
                                    <div class="col-sm-11">
                                        <select name="Category" class="form-control form-control-primary" id="TheLoai">
                                            @foreach ($category as $ct)
                                            <option value="{{$ct->id}}">{{$ct->Name}}</option>
                                            @endforeach
                                        </select>
                                    </div>

                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Sub Category</label>
                                    <div class="col-sm-11">
                                        <select name="SubCategory" class="form-control form-control-primary" id="LoaiTin">
                                            @foreach ($subcategory as $sc)
                                            <option value="{{$sc->id}}">{{$sc->Name}}</option>
                                            @endforeach
                                        </select>
                                    </div>

                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Title</label>
                                    <div class="col-sm-11">
                                        <input type="text" class="form-control" name="Title"
                                            placeholder="Nhập tiêu đề" required>
                                        <span class="messages"></span>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Image</label>
                                    <div class="col-sm-11">
                                        <input type="file" name="Image" class="form-control">
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Type</label>
                                    <div class="col-sm-11">
                                        <select id="checkVideo" name="Type" class="form-control form-control-primary">
                                            <option value="1" selected>Text</option>
                                            <option value="0">Video</option>
                                          
                                        </select>
                                    </div>

                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Link</label>
                                    <div class="col-sm-11">
                                        <input type="text" class="form-control linkvideo" name="Link"
                                            placeholder="Nhập link"  disabled>
                                        <span class="messages"></span>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Summary</label>
                                    <div class="col-sm-11">
                                        <input type="text" class="form-control" name="Summary"
                                            placeholder="Nhập tóm tắt" required>
                                        <span class="messages"></span>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Content</label>
                                    <div class="col-sm-11">
                                    <textarea class="form-control" name="Content" rows="5" id="editor1"></textarea>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Index</label>
                                    <div class="col-sm-11 mt-2">
                                        <label class="radio-inline">
                                            <input name="Index" value="1"  type="radio">YES
                                        </label>
                                        <label class="radio-inline">
                                            <input name="Index" value="0" checked type="radio">NO
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1 col-form-label">Active</label>
                                    <div class="col-sm-11 mt-2">
                                        <label class="radio-inline">
                                            <input name="Active" value="1"  type="radio">YES
                                        </label>
                                        <label class="radio-inline">
                                            <input name="Active" value="0" checked type="radio">NO
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group row">
                                    <label class="col-sm-1"></label>
                                    <div class="col-sm-10">
                                        <button type="submit" class="btn btn-primary m-b-0">Create</button>
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
@section('script')
    <script>    
        $(document).ready(function(){
            $("#TheLoai").change(function(){
              var idCategory = $(this).val();
              $.get("ajax/Subcategory/"+idCategory,function(data){
                    $("#LoaiTin").html(data);
              });
            });
            $('#checkVideo').change(function(){
            if($('#checkVideo option:selected').val()==0)
            {
                $('.linkvideo').removeAttr('disabled');
            }
            else 
                {
                 $('.linkvideo').attr('disabled','');
                 }
            });
        });
    </script>
@endsection