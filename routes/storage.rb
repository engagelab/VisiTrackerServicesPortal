class Iobserve < Sinatra::Application
  ######################## User ##################################
  ### list all storage
  get '/image' do
    if authorized?
      content_type :json
      @storage = Storage.all()
      return @storage.to_json
    else
      status 401
    end
  end

  get '/image/:image_id' do
    if authorized?
      content_type :json
      storage = Storage.find(params[:image_id])
      storage.to_json
    else
      status 401
    end
  end

  #post '/imago' do
  #  filename   = params[:file][:filename]
  #  filextension = filename.split('.').last
  #
  #  uploader = AvatarUploader.new
  #  return uploader.store!(params[:file])
  #
  #
  #
  #end

  ## post image
  post '/image' do
      awskey     = ENV['AWS_ACCESS_KEY_ID']
      awssecret  = ENV['AWS_SECRET_ACCESS_KEY']
      bucket     = 'net.engagelab.iobserveservice'
      file       = params[:file][:tempfile]
      filename   = params[:file][:filename]
      filextension = filename.split('.').last
      imageuid   = SecureRandom.uuid+'.'+filextension

      AWS::S3::DEFAULT_HOST.replace 's3-us-west-2.amazonaws.com'
      AWS::S3::Base.establish_connection!(
          :access_key_id     => awskey,
          :secret_access_key => awssecret
      )

      AWS::S3::S3Object.store(
          imageuid,
          open(file.path),
          bucket,
          :access => :public_read
      )

      if AWS::S3::Service.response.success?
        ui = Storage.create(:name => filename, :url => "http://#{bucket}.s3.amazonaws.com/#{imageuid}", :s3id => imageuid)
        return ui.to_json
      else
        error 404
      end
  end

  ### delete image
  delete '/image/:image_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      media = Storage.find(params[:image_id])

      if media.nil? then
        status 404
      else
        awskey     = ENV['AWS_ACCESS_KEY_ID']
        awssecret  = ENV['AWS_SECRET_ACCESS_KEY']
        bucket     = 'net.engagelab.iobserveservice'

        AWS::S3::DEFAULT_HOST.replace 's3-us-west-2.amazonaws.com'
        AWS::S3::Base.establish_connection!(
            :access_key_id     => awskey,
            :secret_access_key => awssecret
        )

        s3media = AWS::S3::S3Object.delete media.s3id, bucket

        if s3media then
          if media.destroy then
            status 200
            return {"message" => "Image deleted"}.to_json
          else
            status 500
          end
        end
      end
    else
      status 401
    end
  end
end