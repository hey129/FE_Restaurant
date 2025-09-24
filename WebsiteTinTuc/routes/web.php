<?php

use App\Http\Controllers\CategoryController;
use Illuminate\Routing\RouteGroup;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\StaffMiddleware;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/admin', function () {
//     return view('admin.layout.index');
// });
Route::get('admin/login','UserController@getLogin');
Route::get('admin/logout','UserController@getdangxuatadmin');
Route::post('admin/login','UserController@postLogin');
Route::get('login','PagesController@getLogin');
Route::post('login','PagesController@postLogin');
Route::get('signup','PagesController@getSignup');
Route::post('signup','PagesController@postSignup');
Route::get('logout','PagesController@getLogout');


Route::get('/','PagesController@trangchu');
Route::get('/blog','PagesController@blog');
Route::post('/search','PagesController@search');
Route::get('/video','PagesController@video');
Route::get('/news/{id}_{Sort_Title}.html','PagesController@detailsNews');
Route::get('/subcategory/{id}_{Sort_Name}.html','PagesController@subcategory');
Route::get('/category/{id}_{Sort_Name}.html','PagesController@category');
Route::get('/user/{id}','PagesController@userDetails');
Route::get('/trangcanhan','PagesController@userDetails');
Route::get('/editimg.html','PagesController@getEditImg');
Route::post('/editimg.html','PagesController@postEditImg');
Route::post('comment/{id}','CommentController@comment');

Route::group(['prefix'=>'/admin','middleware'=>'staff'],function(){
    Route::get('/','CategoryController@list');
    Route::group(['prefix'=>'category'],function(){
        Route::get('/list','CategoryController@list');
        Route::get('/create','CategoryController@getCreate');
        Route::post('/create','CategoryController@postCreate');
        Route::get('/edit/{id}','CategoryController@getEdit');
        Route::post('/edit/{id}','CategoryController@postEdit');
        Route::get('/active/{id}','CategoryController@postActive');
        Route::get('/block/{id}','CategoryController@postNoActive');
    });
    Route::group(['prefix'=>'subcategory'],function(){
        Route::get('/list','SubCategoryController@list');
        Route::get('/create','SubCategoryController@getCreate');
        Route::post('/create','SubCategoryController@postCreate');
        Route::get('/edit/{id}','SubCategoryController@getEdit');
        Route::post('/edit/{id}','SubCategoryController@postEdit');
        Route::get('/active/{id}','SubCategoryController@postActive');
        Route::get('/block/{id}','SubCategoryController@postNoActive');
    });
    Route::group(['prefix'=>'user'],function(){
        Route::get('/list','UserController@list');
        Route::get('/create','UserController@getCreate');
        Route::post('/create','UserController@postCreate');
        Route::get('/edit/{id}','UserController@getEdit');
        Route::post('/edit/{id}','UserController@postEdit');
        Route::get('/active/{id}','UserController@postActive');
        Route::get('/block/{id}','UserController@postNoActive');
    });
    Route::group(['prefix'=>'news'],function(){
        Route::get('/list','NewsController@list');
        Route::get('/create','NewsController@getCreate');
        Route::post('/create','NewsController@postCreate');
        Route::get('/edit/{id}','NewsController@getEdit');
        Route::post('/edit/{id}','NewsController@postEdit');
        Route::get('/active/{id}','NewsController@postActive');
        Route::get('/block/{id}','NewsController@postNoActive');
    });
    Route::group(['prefix'=>'banner'],function(){
        Route::get('/list','BannerController@list');
        Route::get('/create','BannerController@getCreate');
        Route::post('/create','BannerController@postCreate');
        Route::get('/edit/{id}','BannerController@getEdit');
        Route::post('/edit/{id}','BannerController@postEdit');
        Route::get('/active/{id}','BannerController@postActive');
        Route::get('/block/{id}','BannerController@postNoActive');
    });
    Route::group(['prefix'=>'about'],function(){
        Route::get('/','AboutController@getEdit');
        Route::post('/','AboutController@postEdit');
    });
});




Route::group(['prefix'=>'ajax'],function(){
    Route::get('Subcategory/{idCategory}','AjaxController@getSub');
});

