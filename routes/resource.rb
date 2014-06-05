class Iobserve < Sinatra::Application
  ######################## Action ##################################
  ### create an resource
  post '/resource' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      bdy = request.body.read

      if bdy.length > 2 then
        data = JSON.parse bdy
      else
        halt 404
        return {"message" => "Error: provide a valid JSON"}.to_json
      end

      unless data.nil? or data['type'].nil? then
        newresource = data['type'].upcase

        if Resource.where({ :type => newresource }).count == 0 then
          status 200
          resource = Resource.create(:type => newresource)
          return  resource.to_json
        else
          status 202
          return Resource.where({ :type => newresource }).first().to_json
        end
      else
        status 404
        return {"message" => "Error: provide a valid type"}.to_json
      end
    else
      status 401
    end
  end


  ### list all resources
  get '/resource' do
    if authorized?
      content_type :json
      @resource = Resource.order_by(:_id.asc).all()
      return @resource.to_json
    else
      status 401
    end
  end

  ### list all resources
  get '/resource/simple' do
    if authorized?
      content_type :json
      @resource = Resource.without(:interaction_ids).order_by(:type.asc).all()
      return @resource.to_json
    else
      status 401
    end
  end

  ###  get a resource by id
  get '/resource/:resource_id' do
    if authorized?
      content_type :json
      resource = Resource.find(params[:resource_id])
      return resource.to_json
    else
      status 401
    end
  end


  ### update resource's properties
  put '/resource' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;
      bdy = request.body.read

      if bdy.length > 2 then
        data = JSON.parse bdy
      else
        halt 404
        return {"message" => "Error: provide a valid JSON"}.to_json
      end

      unless data.nil? or data['type'].nil? or Resource.where({ :type => data['type'].upcase }).count > 0 then
        status 200

        resource = Resource.find(data['_id'])
        resource.update_attributes(:type => data['type'].upcase)

        return resource.to_json
      else
        status 404
        return {"message" => "Provide a new type"}.to_json
      end
    else
      status 401
    end
  end

  ### delete a resource by id
  delete '/resource/:resource_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      resource = Resource.find(params[:resource_id])

      if resource.nil? then
        status 404
      else
        if resource.destroy then
          status 200
          return {"message" => "Resource deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end
end
