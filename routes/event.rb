class Iobserve < Sinatra::Application
  ######################## Session ##################################
  ### create an event by session id
  post '/session/:session_id/event' do
    if authorized?
      content_type :json

      sessionob = Sessionob.unscoped.find(params[:session_id])

      unless sessionob.nil? then
        status 200
        eventob = Eventob.create(:created_on => params[:nocache])

        bdy = request.body.read

        if bdy.length > 2 then
          data = JSON.parse bdy
          unless data['interaction_id'].nil? then
            begin
              interaction = Interaction.find(data['interaction_id'])
              if interaction
                eventob.interactions << interaction
              end
            end
          end

          unless data['xpos'].nil?
            eventob.update_attributes(:xpos => data['xpos'])
          end

          unless data['ypos'].nil?
            eventob.update_attributes(:ypos => data['ypos'])
          end

          unless data['label'].nil?
            eventob.update_attributes(:label => data['label'])
          end
        end

        sessionob.eventobs << eventob
        eventob.save
        return eventob.to_json
      else
        status 404
        return {"message" => "Error: provide a valid session id"}.to_json
      end
    else
      status 401
    end
  end


  ### list all events
  get '/event' do
    if authorized?
      content_type :json
      @eventob = Eventob.order_by(:created_on.asc).all()
      return @eventob.to_json
    else
      status 401
    end
  end


  ### list all events by session id
  get '/session/:session_id/events' do
    if authorized?
      content_type :json
      sessionob = Sessionob.unscoped.find(params[:session_id])
      unless sessionob.nil? then
        return sessionob.eventobs.to_json
      end
    else
      status 401
    end
  end

  ### list all events from all sessions by space id and room id
  get '/space/:space_id/:room_id/events' do
    if authorized?
      content_type :json
      sessions = Sessionob.where(:room_id => params[:room_id]).in(:space_ids => params[:space_id])

      unless sessions.nil?

        @allEventsForSessions = [];
        sessions.each do |session|
            sessionob = Sessionob.find(session._id)
            events = sessionob.eventobs
            @allEventsForSessions.push(events)
        end
      end
      '{"sessions" : ' + @allSessionsForSpaceAndRoom.to_json + ', "events" : ' + @allEventsForSessions.to_json + '}'
    else
      status 401
    end
  end

  ### list all events from all sessions by space id and room id for portal
  get '/portal/space/:space_id/:room_id/:startDT/:endDT/:type/events' do
    if authorized?
      content_type :json
      min = params[:startDT].to_i
      max = params[:endDT].to_i
      @alleventsforsessions = []
      sessions = Sessionob.where(:space_ids => params[:space_id], :room_id => params[:room_id], :created_on.gte => min, :finished_on.lte => max).only(:_id, :created_on, :label)
      sessions.each do |session|
        events = session.eventobs
        @alleventsforsessions.push(events.sort_by! { |x| x[:created_on] })
      end
      if params[:type] == 'durationquantity'
        '{"sessions" : ' + sessions.to_json(:only => [ :_id, :created_on, :label ]) + ', "events" : ' + @alleventsforsessions.to_json(:only => [ :_id, :created_on, :finished_on, :xpos, :ypos, :label, :interactions, :visitors, :age, :nationality ]) + '}'
      elsif params[:type] == 'actionsresources'
        '{"sessions" : ' + sessions.to_json(:only => [ :_id, :created_on, :label ]) + ', "events" : ' + @alleventsforsessions.to_json(:except => [:interaction_ids, :visitors]) + '}'
      elsif params[:type] == 'actionsresourcesbubble'
        '{"sessionevents" : ' + @alleventsforsessions.to_json(:only => [:interactions, :actions, :resources, :type]) + '}'
      elsif params[:type] == 'firstTurnEstimation'
        '{"events" : ' + @alleventsforsessions.to_json(:only => [:xpos, :ypos]) + '}'
      end
    else
      status 401
    end
  end

  ###  get an event by id
  get '/event/:event_id' do
    if authorized?
      content_type :json
      eventob = Eventob.find(params[:event_id])
      return eventob.to_json
    else
      status 401
    end
  end

  ### update event's properties
  put '/event' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json;
      data = JSON.parse request.body.read

      unless data.nil? or data['_id'].nil? then
        status 200

        eventob = Eventob.find(data['_id'])

        unless data['comment'].nil?
          eventob.update_attributes(:comment => data['comment'])
        end

        unless data['xpos'].nil?
          eventob.update_attributes(:xpos => data['xpos'])
        end

        unless data['ypos'].nil?
          eventob.update_attributes(:ypos => data['ypos'])
        end

        unless data['label'].nil?
          eventob.update_attributes(:label => data['label'])
        end

        unless data['interaction_id'].nil? then
            begin
              interaction = Interaction.find(data['interaction_id'])
            end

            if interaction
              eventob.interactions << interaction
            end
        end

        eventob.save
        return eventob.to_json
      else
        status 404
        return {"message" => "Provide comment"}.to_json
      end
    else
      status 401
    end
  end

  ### delete an event by id
  delete '/event/:event_id' do
    if authorized?
      request.body.rewind  # in case someone already read it
      content_type :json

      eventob = Eventob.find(params[:event_id])

      if eventob.nil? then
        status 404
      else

        unless eventob.interactions.nil? then
          eventob.interactions.each do|inter|
            interaction = Interaction.find(inter._id)
            interaction.destroy
          end
        end

        sessionob = Sessionob.unscoped.find(eventob.sessionob_id)
        sessionob.eventobs.delete(eventob)

        if eventob.destroy then
          status 200
          return {"message" => "Event deleted"}.to_json
        else
          status 500
        end
      end
    else
      status 401
    end
  end
end
