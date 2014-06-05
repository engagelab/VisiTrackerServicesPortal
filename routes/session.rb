class Iobserve < Sinatra::Application
  ######################## Session ##################################
  ### create a session by space id
  #post '/space/:space_id/session' do
  #  request.body.rewind  # in case someone already read it
  #  content_type :json
  #
  #  begin
  #    space = Space.find(params[:space_id])
  #  end
  #
  #  unless space.nil? then
  #    sessionob = Sessionob.create(:created_on => Time.now.to_i)
  #    visitorgroup = Visitorgroup.create(:created_on => Time.now.to_i)
  #    sessionob.visitorgroup = visitorgroup
  #    space.sessionobs << sessionob
  #    space.save
  #    return sessionob.to_json
  #  else
  #    status 404
  #    return {"message" => "Space not found"}.to_json
  # end
  #end

  post '/space/:space_id/:room_id/session' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      begin
        space = Space.find(params[:space_id])
        room = Room.find(params[:room_id])
      end

      unless space.nil? and room.nil? then
        sessionob = Sessionob.create(:created_on => params[:nocache])
        visitorgroup = Visitorgroup.create(:created_on => params[:nocache])
        sessionob.visitorgroup = visitorgroup
        sessionob.room_id = params[:room_id]
        space.sessionobs << sessionob
        space.save
        return sessionob.to_json
      else
        status 404
        return {"message" => "Space not found"}.to_json
      end
    else
      status 401
    end
  end

  ### list all sessions
  get '/session' do
    if authorized?
      content_type :json
      @sessionob = Sessionob.all()
      return @sessionob.to_json
    else
      status 401
    end
  end

  ### list all unfinished sessions
  get '/unfinishedsessions' do
    if authorized?
      content_type :json
      @sessionob = Sessionob.unscoped.where(:finished_on => nil)
      return @sessionob.to_json
    else
      status 401
    end
  end

  delete '/unfinishedsessions' do
    if authorized?
      counter = 0
      @sessionob = Sessionob.unscoped.where(:finished_on => nil).each do |session|
        if (Time.now.to_i - session.created_on.to_i) > 604800
          call!(env.merge("PATH_INFO" => '/session/' + session._id))
          counter+=1
        end
      end
      'Deleted ' + counter.to_s + ' entries'
    else
      status 401
    end
  end

  ### list all sessions by space id
  ### mongoId is retrieving nested relations. 'includes' is used to prevent possible second hit on database
  get '/space/:space_id/session' do
    if authorized?
      content_type :json
      space = Space.includes(:sessionobs).find(params[:space_id])
      space.sessionobs.to_json
    else
      status 401
    end
  end


  ### list all sessions by space id and room id
  get '/space/:space_id/:room_id/session' do
    if authorized?
      content_type :json
      sessions = Sessionob.where(:room_id => params[:room_id]).in(:space_ids => params[:space_id])
      sessions.to_json
    else
      status 401
    end
  end

  ### list all sessions by space id  and room id for portal
  get '/portal/space/:space_id/:room_id/session' do
    if authorized?
      content_type :json
      sessions = Sessionob.where(:room_id => params[:room_id]).in(:space_ids => params[:space_id])
      sessions.to_json(:only => [ :storage, :url, :_id, :created_on, :finished_on, :label, :visitorgroup, :visitors, :comment, :age, :nationality, :sex ])
    else
      status 401
    end
  end

  ### list all sessions by space id  and room id
  get '/portal/space/:space_id/:room_id/basicSession' do
    if authorized?
      content_type :json
      sessions = Sessionob.where(:room_id => params[:room_id]).in(:space_ids => params[:space_id])
      sessions.to_json(:only => [ :_id, :created_on, :finished_on, :label])
    else
      status 401
    end
  end

  ###  get a session by id
  get '/session/:session_id' do
    if authorized?
      content_type :json
      sessionob = Sessionob.unscoped.find(params[:session_id])
      return sessionob.to_json
    else
      status 401
    end
  end

  ### update session's properties
  put '/session' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;
      data = JSON.parse request.body.read

      unless data.nil? or data['_id'].nil? then
        status 200

        sessionob = Sessionob.unscoped.find(data['_id'])

        unless data['label'].nil?
          sessionob.update_attributes(:label => data['label'])
        end

        return sessionob.to_json
      else
        status 404
        return {"message" => "Provide label"}.to_json
      end
    else
      status 401
    end
  end


  ### update session's properties
  put '/session/:session_id/:map_id/close' do
    if authorized?
      content_type :json
      sessionob = Sessionob.unscoped.find(params[:session_id])

      unless sessionob.nil? then
        status 200

        storage = Storage.find(params[:map_id])

        unless storage.nil?
          sessionob.update_attributes(:finished_on => params[:nocache], :storage => storage)
        end

        return sessionob.to_json
      else
        status 404
        return {"message" => "Provide label"}.to_json
      end
    else
      status 401
    end
  end

  ### delete a session by id
  delete '/session/:session_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      sessionob = Sessionob.unscoped.find(params[:session_id])

      if sessionob.nil? then
        status 404
      else
        unless sessionob.visitorgroup.nil? then
          visitorgroup = Visitorgroup.find(sessionob.visitorgroup._id)

          unless visitorgroup.visitors.nil? then
            visitorgroup.visitors.each do|visitor|
              visitor = Visitor.find(visitor._id)
              visitor.destroy
            end
          end

          visitorgroup.destroy
        end

        unless sessionob.storage.nil? then
          storage = Storage.find(sessionob.storage._id)
          storage.destroy
        end

        unless sessionob.eventob_ids.nil? then
          sessionob.eventob_ids.each do|evt|
            eventob = Eventob.find(evt)

            unless eventob.interactions.nil? then
              eventob.interactions.each do|inter|
                interaction = Interaction.find(inter._id)
                interaction.destroy
              end
            end

            eventob.destroy
          end
        end

        if sessionob.destroy then
          status 200
          return {"message" => "Session deleted"}.to_json
        else
          status 500
        end
      end
    else
     status 401
    end
  end
end
