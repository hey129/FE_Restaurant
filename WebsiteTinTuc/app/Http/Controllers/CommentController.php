<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use App\Comment;
use App\News;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function getDelete($id,$idNews)
    {
        $comment = Comment::find($id);
        $comment->delete();
        return redirect('admin/news/edit/'.$idNews)->with('thongbao','Xóa bình luận thành công');
    }
    public function comment($id,Request $request)
    {
        $idNews = $id;
        $news = News::find($id);
        $comment = new Comment();
        $comment->idUser = Auth::user()->id;
        $comment->idNews = $idNews;
        $comment->Content = $request->comment;
        $comment->save();
        return redirect('news/'.$id.'_'.$news->Sort_Title.'.html')->with('thongbao','Update thành công');
    }
    public function postActive($id)
    {
        $comment = Comment::find($id);
        $comment->Active =1;
        $comment->save();
        return redirect('admin/comment/list')->with('thongbao','Update thành công');
    }
    public function postNoActive($id)
    {
        $comment = Comment::find($id);
        $comment->Active =0;
        $comment->save();
        return redirect('admin/comment/list')->with('thongbao','Update thành công');
    }

}
